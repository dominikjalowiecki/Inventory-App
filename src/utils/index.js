export function stateToBackground(state) {
  switch (state) {
    case 'OK':
      return 'success';
    case 'POŻYCZONY':
      return 'warning';
    case 'USZKODZONY':
      return 'danger';
    default:
      return 'secondary';
  }
}
