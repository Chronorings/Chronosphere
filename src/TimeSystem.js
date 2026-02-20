let timeScale = 1;

export function setTimeScale(scale) {
  timeScale = scale;
}

export function getPhase(periodMs) {

  const now = new Date();

  const localTimeMs =
    now.getHours() * 3600000 +
    now.getMinutes() * 60000 +
    now.getSeconds() * 1000 +
    now.getMilliseconds();

  return (localTimeMs % periodMs) / periodMs * Math.PI * 2;
}