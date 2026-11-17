import * as migration_20261117_073848_supabase_initial from './20261117_073848_supabase_initial';

export const migrations = [
  {
    up: migration_20261117_073848_supabase_initial.up,
    down: migration_20261117_073848_supabase_initial.down,
    name: '20261117_073848_supabase_initial'
  },
];
