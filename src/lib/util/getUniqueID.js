let uuid = Date.now();

export default function getUniqueID() {
  return `rnmr_${(++uuid).toString(36)}`;
}
