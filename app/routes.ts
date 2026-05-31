import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("etf/:slug", "routes/etf.$slug.tsx"),
] satisfies RouteConfig;
