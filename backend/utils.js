function changeEpochToReadable(epoch) {
  const date = new Date(epoch);
  return date.toUTCString();
}

export { changeEpochToReadable };
