import { log } from './logger';

describe('log', () => {
  it('should log an error', () => {
    // Arrange
    const expectedMsg = 'expected message';
    const expectedErr = new Error('expect error');
    const spy = jest.spyOn(console, 'error').mockReturnValue(undefined);

    // Act
    log.error(expectedMsg, expectedErr);

    // Assert
    expect(spy).toHaveBeenCalledWith(expectedMsg, expectedErr);
  });

  it('should log a warning', () => {
    // Arrange
    const expectedMsg = 'expected message';
    const expectedErr = new Error('expect error');
    const spy = jest.spyOn(console, 'warn').mockReturnValue(undefined);

    // Act
    log.warn(expectedMsg, expectedErr);

    // Assert
    expect(spy).toHaveBeenCalledWith(expectedMsg, expectedErr);
  });
});
