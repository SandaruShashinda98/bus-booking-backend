export enum PERMISSIONS {
  // //user management related
  // CREATE_USER = 'CREATE_USER', // Can create users
  // DELETE_USER = 'DELETE_USER', // Can delete users
  // EDIT_USER = 'EDIT_USER', // Can edit users
  // SHOW_USER = 'SHOW_USER', // Can view users

  // //roles related
  // CREATE_ROLE = 'CREATE_ROLE', // Can create roles
  // EDIT_ROLE = 'EDIT_ROLE', // Can edit roles
  // DELETE_ROLE = 'DELETE_ROLE', // Can delete roles
  // SHOW_ROLE = 'SHOW_ROLE', // Can view roles

  // //api related
  // ACCESS_API_KEY = 'ACCESS_API_KEY', // Can access the API key
  // API_DOCS = 'API_DOCS', // Can access PBX Stats API documents

  // //other
  // DO_AGENT_LOGOUT = 'DO_AGENT_LOGOUT', // Can log out an agent via the realtime page
  // DO_AGENT_PAUSE = 'DO_AGENT_PAUSE', // Can pause an agent via the realtime page
  // DO_AGENT_WHISPER = 'DO_AGENT_WHISPER', // Can whisper to agents via the realtime page
  // DOWNLOAD_AGENT_STATS = 'DOWNLOAD_AGENT_STATS', // Can download the Agent Statistics report
  // DOWNLOAD_RECORDING = 'DOWNLOAD_RECORDING', // Can download call recordings from CDRs
  // LISTEN_RECORDING = 'LISTEN_RECORDING', // Can listen to call recordings in the CDR list
  // SHOW_AGENT = 'SHOW_AGENT', // Can view agents
  // SHOW_AGENT_STATS = 'SHOW_AGENT_STATS', // Can view the Agent Statistics report

  SUPER_ADMIN = 'SUPER_ADMIN', // Can access all sections and features of PBX Stats
  ADMIN = 'ADMIN', // Can access all sections and features of PBX Stats
  AGENT = 'AGENT', // Can access Workspace
  SUPPORT = 'SUPPORT', // Can access all sections except Workspace
}

export const PERMISSIONS_DESCRIPTION: Record<string, string> = {
  // //user management related
  // CREATE_USER: 'Can create users',
  // DELETE_USER: 'Can delete users',
  // EDIT_USER: 'Can edit users',
  // SHOW_USER: 'Can view users',

  // //roles related
  // CREATE_ROLE: 'Can create roles',
  // EDIT_ROLE: 'Can edit roles',
  // DELETE_ROLE: 'Can delete roles',
  // SHOW_ROLE: 'Can view roles',

  // //api related
  // ACCESS_API_KEY: 'Can access the API key',
  // API_DOCS: 'Can access PBX Stats API documents',

  // //other
  // DO_AGENT_LOGOUT: 'Can log out an agent via the realtime page',
  // DO_AGENT_PAUSE: 'Can pause an agent via the realtime page',
  // DO_AGENT_WHISPER: 'Can whisper to agents via the realtime page',
  // DOWNLOAD_AGENT_STATS: 'Can download the Agent Statistics report',
  // DOWNLOAD_RECORDING: 'Can download call recordings from CDRs',
  // LISTEN_RECORDING: 'Can listen to call recordings in the CDR list',
  // SHOW_AGENT: 'Can view agents',
  // SHOW_AGENT_STATS: 'Can view the Agent Statistics report',

  ADMIN: 'Can access all sections and features of PBX Stats',
  AGENT: 'Can access Workspace',
  SUPPORT: 'Can access all sections except Workspace',
};
