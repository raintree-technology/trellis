process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const direct = { rejectUnauthorized: false };
const quoted = { "rejectUnauthorized": false };

direct.rejectUnauthorized = false;
quoted["rejectUnauthorized"] = false;
quoted['rejectUnauthorized'] = false;
