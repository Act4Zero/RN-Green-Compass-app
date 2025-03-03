/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/context/AuthContext`; params?: Router.UnknownInputParams; } | { pathname: `/lib/supabase`; params?: Router.UnknownInputParams; } | { pathname: `/types/supabase`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `/context/AuthContext`; params?: Router.UnknownOutputParams; } | { pathname: `/lib/supabase`; params?: Router.UnknownOutputParams; } | { pathname: `/types/supabase`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | `/context/AuthContext${`?${string}` | `#${string}` | ''}` | `/lib/supabase${`?${string}` | `#${string}` | ''}` | `/types/supabase${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/context/AuthContext`; params?: Router.UnknownInputParams; } | { pathname: `/lib/supabase`; params?: Router.UnknownInputParams; } | { pathname: `/types/supabase`; params?: Router.UnknownInputParams; };
    }
  }
}
