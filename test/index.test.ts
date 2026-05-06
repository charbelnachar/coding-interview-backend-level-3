// Aggregator test file - imports and runs all test suites
import './unit/items/item.validator.spec';
import './unit/items/item.service.spec';
import './unit/middlewares/auth.middleware.spec';
import './unit/middlewares/error-handler.middleware.spec';
import './unit/config/config.spec';
import './integration/items/item.routes.spec';
import './integration/health/health.routes.spec';
import './integration/history/history.integration.spec';
