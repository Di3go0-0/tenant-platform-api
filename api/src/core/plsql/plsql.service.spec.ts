import { Test, TestingModule } from '@nestjs/testing';
import { PlsqlService } from './plsql.service.js';
import { DATABASE_POOL } from '../../infrastructure/database/index.js';

describe('PlsqlService', () => {
  let service: PlsqlService;
  const mockPool = {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlsqlService,
        { provide: DATABASE_POOL, useValue: mockPool },
      ],
    }).compile();

    service = module.get<PlsqlService>(PlsqlService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('executeQuery', () => {
    it('should execute a query with params', async () => {
      const mockResult = { rows: [{ id: 1 }], rowCount: 1 };
      mockPool.query.mockResolvedValue(mockResult);

      const result = await service.executeQuery(
        'SELECT * FROM users WHERE id = $1',
        [1],
      );

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = $1',
        [1],
      );
      expect(result).toEqual(mockResult);
    });

    it('should throw on query failure', async () => {
      mockPool.query.mockRejectedValue(new Error('Connection refused'));

      await expect(service.executeQuery('SELECT 1')).rejects.toThrow(
        'Connection refused',
      );
    });
  });

  describe('executeQueryOne', () => {
    it('should return first row', async () => {
      const mockResult = { rows: [{ id: 1, name: 'test' }], rowCount: 1 };
      mockPool.query.mockResolvedValue(mockResult);

      const result = await service.executeQueryOne('SELECT * FROM users WHERE id = $1', [1]);

      expect(result).toEqual({ id: 1, name: 'test' });
    });

    it('should return null when no rows', async () => {
      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      const result = await service.executeQueryOne(
        'SELECT * FROM users WHERE id = $1',
        [999],
      );

      expect(result).toBeNull();
    });
  });

  describe('executeQueryMany', () => {
    it('should return all rows', async () => {
      const rows = [{ id: 1 }, { id: 2 }];
      mockPool.query.mockResolvedValue({ rows, rowCount: 2 });

      const result = await service.executeQueryMany('SELECT * FROM users');

      expect(result).toEqual(rows);
    });
  });

  describe('executeTransaction', () => {
    it('should commit on success', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [{ id: 1 }] }),
        release: jest.fn(),
      };
      mockPool.connect.mockResolvedValue(mockClient);

      const result = await service.executeTransaction(async (query) => {
        const res = await query('INSERT INTO users (name) VALUES ($1) RETURNING *', ['test']);
        return res.rows[0];
      });

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toEqual({ id: 1 });
    });

    it('should rollback on error', async () => {
      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce(undefined) // BEGIN
          .mockRejectedValueOnce(new Error('duplicate key')) // actual query
          .mockResolvedValueOnce(undefined), // ROLLBACK
        release: jest.fn(),
      };
      mockPool.connect.mockResolvedValue(mockClient);

      await expect(
        service.executeTransaction(async (query) => {
          await query('INSERT INTO users (name) VALUES ($1)', ['test']);
        }),
      ).rejects.toThrow('duplicate key');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});
