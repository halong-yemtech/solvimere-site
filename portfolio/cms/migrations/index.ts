import * as migration_20261113_170004_initial from './20261113_170004_initial';
import * as migration_20261113_182647_blob_storage from './20261113_182647_blob_storage';
import * as migration_20261113_184025_foundations from './20261113_184025_foundations';
import * as migration_20261113_192654_profiles_and_roles from './20261113_192654_profiles_and_roles';
import * as migration_20261113_200303_cv_fields from './20261113_200303_cv_fields';
import * as migration_20261114_022106_blog_posts from './20261114_022106_blog_posts';
import * as migration_20261114_023806_blog_post_image from './20261114_023806_blog_post_image';
import * as migration_20261114_024829_blog_post_github from './20261114_024829_blog_post_github';
import * as migration_20261114_031514_profile_ownership_and_links from './20261114_031514_profile_ownership_and_links';
import * as migration_20261114_030000_remove_zoominfo from './20261114_030000_remove_zoominfo';

export const migrations = [
  {
    up: migration_20261113_170004_initial.up,
    down: migration_20261113_170004_initial.down,
    name: '20261113_170004_initial',
  },
  {
    up: migration_20261113_182647_blob_storage.up,
    down: migration_20261113_182647_blob_storage.down,
    name: '20261113_182647_blob_storage',
  },
  {
    up: migration_20261113_184025_foundations.up,
    down: migration_20261113_184025_foundations.down,
    name: '20261113_184025_foundations',
  },
  {
    up: migration_20261113_192654_profiles_and_roles.up,
    down: migration_20261113_192654_profiles_and_roles.down,
    name: '20261113_192654_profiles_and_roles',
  },
  {
    up: migration_20261113_200303_cv_fields.up,
    down: migration_20261113_200303_cv_fields.down,
    name: '20261113_200303_cv_fields',
  },
  {
    up: migration_20261114_022106_blog_posts.up,
    down: migration_20261114_022106_blog_posts.down,
    name: '20261114_022106_blog_posts',
  },
  {
    up: migration_20261114_023806_blog_post_image.up,
    down: migration_20261114_023806_blog_post_image.down,
    name: '20261114_023806_blog_post_image',
  },
  {
    up: migration_20261114_024829_blog_post_github.up,
    down: migration_20261114_024829_blog_post_github.down,
    name: '20261114_024829_blog_post_github',
  },
  {
    up: migration_20261114_030000_remove_zoominfo.up,
    down: migration_20261114_030000_remove_zoominfo.down,
    name: '20261114_030000_remove_zoominfo'
  },
  {
    up: migration_20261114_031514_profile_ownership_and_links.up,
    down: migration_20261114_031514_profile_ownership_and_links.down,
    name: '20261114_031514_profile_ownership_and_links',
  },
];
