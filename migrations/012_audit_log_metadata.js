// migrations/012_audit_log_metadata.js

export async function up(pgm) {
  pgm.addColumns('audit_log', {
    request_id: {
      type: 'text',
      comment: 'Request correlation ID',
    },
    ip_address: {
      type: 'text',
      comment: 'Client IP address',
    },
    user_agent: {
      type: 'text',
      comment: 'Client User Agent',
    },
  });

  pgm.createIndex('audit_log', 'request_id');
}

export async function down(pgm) {
  pgm.dropColumns('audit_log', ['request_id', 'ip_address', 'user_agent']);
}

