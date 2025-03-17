module.exports = {
  async up(db) {
    // Add new fields to all existing documents in the leads collection
    await db.collection('leads').updateMany(
      {}, // Match all documents
      {
        $set: {
          campaign_id: null,
        },
      },
    );

    // Create indexes for the new reference fields to improve query performance
    await db.collection('leads').createIndex({ campaign_id: 1 });
  },

  async down(db) {
    // Remove the new fields from all documents
    await db.collection('leads').updateMany(
      {}, // Match all documents
      {
        $unset: {
          campaign_id: '',
          desk_id: '',
          skill_group_id: '',
        },
      },
    );

    // Drop the indexes created for these fields
    await db.collection('leads').dropIndex('campaign_id_1');
    await db.collection('leads').dropIndex('desk_id_1');
    await db.collection('leads').dropIndex('skill_group_id_1');
  },
};
