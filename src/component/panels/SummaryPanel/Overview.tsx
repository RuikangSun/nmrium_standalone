import styled from '@emotion/styled';
import { getAtomCounts } from 'nmr-correlation';
import { memo } from 'react';

import { ErrorColors, Errors } from './CorrelationTable/Constants.js';

const Container = styled.div`
  display: flex;
  width: 100%;
  font-size: 15px;
  font-weight: 300;
  white-space: nowrap;

  span {
    margin-left: 8px;
  }
`;

interface OverviewProps {
  correlationsData?: {
    options: {
      mf: string;
    };
    state: any;
  };
}

function Overview({ correlationsData }: OverviewProps) {
  if (!correlationsData) {
    return null;
  }

  const atoms = getAtomCounts(correlationsData.options.mf);

  const elements =
    Object.keys(atoms).length > 0 ? (
      Object.keys(atoms).map((atomType, i) => {
        const stateAtomType = correlationsData.state[atomType];
        const error = stateAtomType ? stateAtomType.error : undefined;
        const errorColorIndex = error
          ? Errors.findIndex((_error) => error[_error] !== undefined)
          : -1;

        return (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={`molFormulaView_${i}`}
            style={{
              color: stateAtomType
                ? stateAtomType.complete === true &&
                  (!error || Object.keys(error).length === 0)
                  ? 'green'
                  : errorColorIndex >= 0
                    ? ErrorColors[errorColorIndex].color
                    : 'black'
                : 'black',
            }}
          >
            {`${atomType}: ${stateAtomType ? stateAtomType.current : '-'}/${
              atoms[atomType]
            }   `}
          </span>
        );
      })
    ) : (
      <p style={{ fontStyle: 'italic', color: 'orange' }}>
        Molecular formula is not set
      </p>
    );

  return <Container>{elements}</Container>;
}

export default memo(Overview);
