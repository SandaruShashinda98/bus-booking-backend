// migrations/20241218_rename_upload_id.js

module.exports = {
  // Migration Up: Renames uploadId to upload_id
  async up(db) {
    try {
      const result = await db.collection('leads').updateMany(
        {}, // Match all documents
        {
          $rename: {
            uploadId: 'upload_id',
          },
        },
      );

      console.log(`Migration Up completed successfully!`);
      console.log(`Modified ${result.modifiedCount} documents`);

      return { success: true, modifiedCount: result.modifiedCount };
    } catch (error) {
      console.error('Migration Up failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Migration Down: Reverts upload_id back to uploadId
  async down(db) {
    try {
      const result = await db.collection('leads').updateMany(
        {}, // Match all documents
        {
          $rename: {
            upload_id: 'uploadId',
          },
        },
      );

      console.log(`Migration Down completed successfully!`);
      console.log(`Modified ${result.modifiedCount} documents`);

      return { success: true, modifiedCount: result.modifiedCount };
    } catch (error) {
      console.error('Migration Down failed:', error);
      return { success: false, error: error.message };
    }
  },
};
