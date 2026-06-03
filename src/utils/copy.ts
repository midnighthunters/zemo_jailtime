const evidenceLines = [
  'Exhibit A: {app} was opened after the warning.',
  'Exhibit B: The same suspect returned to the scene.',
  'Exhibit C: Your dreams filed a complaint.',
  'Exhibit D: Focus was interrupted with intent.',
];

export function evidenceLine(appName: string, openCount: number) {
  const template = evidenceLines[openCount % evidenceLines.length];
  return template.replace('{app}', appName);
}

export function randomCaseId() {
  return `Case #${Math.floor(40 + Math.random() * 900)
    .toString()
    .padStart(3, '0')}`;
}
