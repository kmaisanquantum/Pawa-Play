import { HealthController } from '../../src/common/health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController();
  });

  it('should return status ok', () => {
    expect(controller.check()).toEqual({ status: 'ok' });
  });
});
