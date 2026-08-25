import { createRouter, createRoute } from '@tanstack/react-router';
import { rootRoute } from './routes/__root';
import { BasinSelectionPage } from './routes/index';
import { BasinLayout } from './components/layout/BasinLayout';
import { BasinOverviewPage } from './routes/basin/$basinSlug.index';
import { NearbyStationDiscoveryPage } from './routes/basin/$basinSlug.nearby';
import { BasinMapPage } from './routes/basin/$basinSlug.map';
import { StationListPage } from './routes/basin/$basinSlug.station.index';
import { StationDetailPage } from './routes/basin/$basinSlug.station.$stationId';
import { EventsAndAlertsPage } from './routes/basin/$basinSlug.event';
import { SituationReportPage } from './routes/basin/$basinSlug.report';
import { SettingsPage } from './routes/basin/$basinSlug.settings';

// 1. Root index route (Basin list)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: BasinSelectionPage,
});

// 2. Basin Layout route
const basinLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'basin/$basinSlug',
  component: BasinLayout,
});

// 3. Basin sub-pages
const basinIndexRoute = createRoute({
  getParentRoute: () => basinLayoutRoute,
  path: '/',
  component: BasinOverviewPage,
});

const basinNearbyRoute = createRoute({
  getParentRoute: () => basinLayoutRoute,
  path: 'nearby',
  component: NearbyStationDiscoveryPage,
});

const basinMapRoute = createRoute({
  getParentRoute: () => basinLayoutRoute,
  path: 'map',
  component: BasinMapPage,
});

const basinStationIndexRoute = createRoute({
  getParentRoute: () => basinLayoutRoute,
  path: 'station',
  component: StationListPage,
});

const basinStationDetailRoute = createRoute({
  getParentRoute: () => basinLayoutRoute,
  path: 'station/$stationId',
  component: StationDetailPage,
});

const basinEventRoute = createRoute({
  getParentRoute: () => basinLayoutRoute,
  path: 'event',
  component: EventsAndAlertsPage,
});

const basinReportRoute = createRoute({
  getParentRoute: () => basinLayoutRoute,
  path: 'report',
  component: SituationReportPage,
});

const basinSettingsRoute = createRoute({
  getParentRoute: () => basinLayoutRoute,
  path: 'settings',
  component: SettingsPage,
});

// Construct complete router tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  basinLayoutRoute.addChildren([
    basinIndexRoute,
    basinNearbyRoute,
    basinMapRoute,
    basinStationIndexRoute,
    basinStationDetailRoute,
    basinEventRoute,
    basinReportRoute,
    basinSettingsRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

// Declare TanStack Router types
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
