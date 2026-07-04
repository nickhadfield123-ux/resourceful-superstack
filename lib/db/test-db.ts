import { db } from './cockpit-db';
import { toast } from '@/toast';
import { unifiedStorage } from './unified-storage';

// Test function to verify database functionality
export async function testDatabase() {
  try {
    console.log('🧪 Testing CockpitDB...');
    
    // Test 1: Add a test media entry
    const testMedia: any = {
      id: 'test-media-1',
      type: 'image',
      blob: new Blob(['test image data'], { type: 'image/png' }),
      mimeType: 'image/png',
      fileSize: 15,
      context: {
        title: 'Test Image',
        description: 'This is a test image for database validation',
        tags: ['test', 'image'],
        category: 'general',
        purpose: 'testing'
      },
      createdAt: new Date()
    };

    await db.media.add(testMedia);
    console.log('✅ Test media entry added');

    // Test 2: Retrieve the test media
    const retrievedMedia = await db.media.get('test-media-1');
    if (retrievedMedia) {
      console.log('✅ Test media entry retrieved:', retrievedMedia);
    } else {
      throw new Error('Failed to retrieve test media');
    }

    // Test 3: Add a test conversation
    const testConversation: any = {
      id: 'test-conversation-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      title: 'Test Conversation',
      messages: [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Hello, this is a test message',
          timestamp: new Date()
        }
      ]
    };

    await db.conversations.add(testConversation);
    console.log('✅ Test conversation added');

    // Test 4: Add a test KB entry
    const testKBEntry: any = {
      id: 'test-kb-1',
      type: 'note',
      title: 'Test Knowledge Entry',
      content: 'This is test knowledge content',
      tags: ['test', 'knowledge'],
      category: 'general',
      priority: 'medium',
      mediaIds: [],
      relatedKBIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.kbEntries.add(testKBEntry);
    console.log('✅ Test KB entry added');

    // Test 5: Query all entries
    const allMedia = await db.media.toArray();
    const allConversations = await db.conversations.toArray();
    const allKBEntries = await db.kbEntries.toArray();

    console.log('📊 Database contents:');
    console.log(`   Media entries: ${allMedia.length}`);
    console.log(`   Conversation entries: ${allConversations.length}`);
    console.log(`   KB entries: ${allKBEntries.length}`);

    // Test 6: Clean up test data
    await db.media.delete('test-media-1');
    await db.conversations.delete('test-conversation-1');
    await db.kbEntries.delete('test-kb-1');
    console.log('✅ Test data cleaned up');

    console.log('🎉 All database tests passed!');
    toast.success('Database test completed successfully!');
    
    return true;

  } catch (error) {
    console.error('❌ Database test failed:', error);
    toast.error('Database test failed. Check console for details.');
    return false;
  }
}

// Function to check if database is accessible
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // Try to access the database
    const count = await db.media.count();
    console.log(`Database health check: ${count} media entries found`);
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Test function to verify UnifiedStorage functionality
export async function testUnifiedStorage(): Promise<boolean> {
  try {
    console.log('🧪 Testing UnifiedStorage...');
    
    // Initialize the storage system
    await unifiedStorage.initialize();
    console.log('✅ UnifiedStorage initialized');
    
    // Test media operations
    const testMedia = {
      id: 'test-media-unified-1',
      type: 'image' as const,
      blob: new Blob(['test image data'], { type: 'image/png' }),
      mimeType: 'image/png',
      fileSize: 15,
      context: {
        title: 'Test Image via UnifiedStorage',
        description: 'This is a test image using UnifiedStorage',
        tags: ['test', 'unified'],
        category: 'general',
        purpose: 'testing'
      },
      createdAt: new Date()
    };

    const mediaId = await unifiedStorage.addMediaEntry(testMedia);
    console.log(`✅ Media added via UnifiedStorage: ${mediaId}`);
    
    const retrievedMedia = await unifiedStorage.getMediaEntry(mediaId);
    console.log('✅ Media retrieved via UnifiedStorage:', retrievedMedia);
    
    // Test conversation operations
    const testConversation = {
      id: 'test-conversation-unified-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      title: 'Test Conversation via UnifiedStorage',
      messages: [
        {
          id: 'msg-1',
          role: 'user' as const,
          content: 'Hello, this is a test message via UnifiedStorage',
          timestamp: new Date()
        }
      ]
    };

    const conversationId = await unifiedStorage.addConversation(testConversation);
    console.log(`✅ Conversation added via UnifiedStorage: ${conversationId}`);
    
    // Test KB operations
    const testKBEntry = {
      id: 'test-kb-unified-1',
      type: 'note' as const,
      title: 'Test KB Entry via UnifiedStorage',
      content: 'This is test knowledge content via UnifiedStorage',
      tags: ['test', 'unified', 'knowledge'],
      category: 'general',
      priority: 'medium' as const,
      mediaIds: [],
      relatedKBIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const kbId = await unifiedStorage.addKBEntry(testKBEntry);
    console.log(`✅ KB entry added via UnifiedStorage: ${kbId}`);
    
    // Test statistics
    const stats = await unifiedStorage.getStorageStats();
    console.log('📊 Storage stats:', stats);
    
    // Clean up
    await unifiedStorage.deleteMediaEntry(mediaId);
    await unifiedStorage.deleteConversation(conversationId);
    await unifiedStorage.deleteKBEntry(kbId);
    console.log('✅ Test data cleaned up via UnifiedStorage');
    
    console.log('🎉 All UnifiedStorage tests passed!');
    toast.success('UnifiedStorage test completed successfully!');
    
    return true;

  } catch (error) {
    console.error('❌ UnifiedStorage test failed:', error);
    toast.error('UnifiedStorage test failed. Check console for details.');
    return false;
  }
}
