import type { FromTo } from 'cheminfo-types';

type DefaultPathLengthsInterface = Record<string, FromTo>;

const DefaultPathLengths: DefaultPathLengthsInterface = {
  hmbc: { from: 2, to: 3 },
  cosy: { from: 3, to: 4 },
  hsqc: { from: 1, to: 1 },
  hmqc: { from: 1, to: 1 },
  inadequate: { from: 1, to: 1 },
};

export default DefaultPathLengths;
