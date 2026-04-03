/**
 * File Persistence Writer 单元测试
 */

import { FilePersistenceWriter, createPersistenceWriter } from '../src/index';

describe('FilePersistenceWriter', () => {
  let writer: FilePersistenceWriter;

  beforeEach(() => {
    writer = createPersistenceWriter('/workspace');
  });

  test('应该能创建写入器实例', () => {
    expect(writer).toBeInstanceOf(FilePersistenceWriter);
  });

  test('解析指令 - 提取文件路径', () => {
    const instruction = '更新 SOUL.md 文件，添加新的核心原则';
    const parsed = writer.parseInstruction(instruction);
    
    expect(parsed.filePath).toBe('SOUL.md');
    expect(parsed.type).toBe('edit');
  });

  test('解析指令 - 创建文件', () => {
    const instruction = '创建新文件 memory/2026-03-12.md';
    const parsed = writer.parseInstruction(instruction);
    
    expect(parsed.filePath).toBe('memory/2026-03-12.md');
    expect(parsed.type).toBe('create');
  });

  test('解析指令 - 追加内容', () => {
    const instruction = '追加内容到 HEARTBEAT.md';
    const parsed = writer.parseInstruction(instruction);
    
    expect(parsed.filePath).toBe('HEARTBEAT.md');
    expect(parsed.type).toBe('append');
  });

  test('解析指令 - 未找到文件路径时报错', () => {
    const instruction = '帮我写点东西';
    
    expect(() => writer.parseInstruction(instruction)).toThrow('未找到目标文件路径');
  });

  test('应该能生成写入凭证', async () => {
    const instruction = '更新 TOOLS.md 添加新工具配置';
    const receipt = await writer.persist(instruction);
    
    expect(receipt.status).toBe('success');
    expect(receipt.verified).toBe(true);
    expect(receipt.commitHash).toBeDefined();
  });
});
