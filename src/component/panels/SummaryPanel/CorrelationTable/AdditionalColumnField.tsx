import type { Correlation, Link } from 'nmr-correlation';
import { buildLink } from 'nmr-correlation';
import { useCallback, useMemo } from 'react';

import { buildID } from '../../../../data/utilities/Concatenation.js';
import { findRangeOrZoneID } from '../../../../data/utilities/FindUtilities.js';
import { ContextMenu } from '../../../elements/ContextMenuBluePrint.js';
import { useDialog } from '../../../elements/DialogManager.js';
import { useHighlight } from '../../../highlight/index.js';
import {
  cloneCorrelationAndEditLink,
  getAbbreviation,
} from '../utilities/Utilities.js';
import useInView from '../utilities/useInView.js';

import type { EditLinkDialogData } from './editLink/EditLinkModal.js';
import { EditLinkModal } from './editLink/EditLinkModal.js';

function getLinkText(link: Link) {
  const {
    signal: { x, y },
    edited,
  } = link;

  const deltaX = x?.delta?.toFixed(2) ?? '?';
  const deltaY = y?.delta?.toFixed(2) ?? '?';
  const movedLabel = edited?.moved ? '[MOVED]' : '';

  return `${getAbbreviation(link)} (${deltaX} , ${deltaY}) ${movedLabel}`;
}

function AdditionalColumnField({
  rowCorrelation,
  columnCorrelation,
  commonLinks,
  spectraData,
  onEdit,
}) {
  const { openDialog } = useDialog();

  const highlightIDsCommonLinks = useMemo(() => {
    return commonLinks.flatMap((link: Link) => {
      const ids: string[] = [];
      if (!link.pseudo) {
        ids.push(link.signal.id, buildID(link.signal.id, 'Crosshair'));
        const _id = findRangeOrZoneID(
          spectraData,
          link.experimentID,
          link.signal.id,
          true,
        );
        if (_id) {
          ids.push(_id);
        }
      }
      return ids;
    });
  }, [commonLinks, spectraData]);
  const highlightCommonLinks = useHighlight(highlightIDsCommonLinks);

  const mouseEnterHandler = useCallback(
    (event) => {
      event.currentTarget.focus();
      highlightCommonLinks.show();
    },
    [highlightCommonLinks],
  );
  const mouseLeaveHandler = useCallback(
    (event) => {
      event.currentTarget.blur();
      highlightCommonLinks.hide();
    },
    [highlightCommonLinks],
  );

  function contextMenuHandler(data) {
    highlightCommonLinks.hide();
    openDialog<EditLinkDialogData>(EditLinkModal, data);
  }

  const handleEditPseudoHSQC = useCallback(
    (action: 'add' | 'remove', link?: Link) => {
      const pseudoLinkCountHSQC = rowCorrelation.link.filter(
        (_link) =>
          (_link.experimentType === 'hsqc' ||
            _link.experimentType === 'hmqc') &&
          _link.pseudo === true,
      ).length;

      let _correlationDim1: Correlation;
      let _correlationDim2: Correlation;
      if (action === 'add') {
        const commonPseudoLink = buildLink({
          experimentType: 'hsqc',
          experimentID: crypto.randomUUID(),
          atomType: [columnCorrelation.atomType, rowCorrelation.atomType],
          id: crypto.randomUUID(),
          pseudo: true,
          signal: { id: crypto.randomUUID(), sign: 0 }, // pseudo signal
        });
        _correlationDim1 = cloneCorrelationAndEditLink(
          columnCorrelation,
          commonPseudoLink,
          'x',
          'add',
        );
        _correlationDim2 = cloneCorrelationAndEditLink(
          rowCorrelation,
          commonPseudoLink,
          'y',
          'add',
        );
        // increase number of attached protons if no value was specified manually before
        if (!_correlationDim2.edited.protonsCount) {
          _correlationDim2.protonsCount = [pseudoLinkCountHSQC + 1];
        }
      } else {
        _correlationDim1 = cloneCorrelationAndEditLink(
          columnCorrelation,
          link,
          'x',
          'remove',
        );
        _correlationDim2 = cloneCorrelationAndEditLink(
          rowCorrelation,
          link,
          'y',
          'remove',
        );
        // decrease number of attached protons if no value was specified manually before
        if (!_correlationDim2.edited.protonsCount) {
          _correlationDim2.protonsCount =
            pseudoLinkCountHSQC - 1 > 0 ? [pseudoLinkCountHSQC - 1] : [];
        }
      }

      onEdit([_correlationDim1, _correlationDim2], action, link, {
        skipDataUpdate: true,
      });
    },
    [columnCorrelation, onEdit, rowCorrelation],
  );

  const contextMenu = useMemo(() => {
    // allow the edition of correlations
    const commonLinksMenu = commonLinks.flatMap((commonLink) => {
      if (commonLink.pseudo !== false) {
        return [];
      }

      return [
        {
          text: `Edit ${getLinkText(commonLink)}`,
          icon: 'edit',
          data: {
            link: commonLink,
            correlationDim1: columnCorrelation,
            correlationDim2: rowCorrelation,
          },
        },
      ];
    });
    // allow addition or removal of a pseudo HSQC link between pseudo heavy atom and proton
    const commonPseudoLinkHSQC = commonLinks.find(
      (commonLink) =>
        commonLink.pseudo === true && commonLink.experimentType === 'hsqc',
    );
    if (rowCorrelation.pseudo === true) {
      if (commonPseudoLinkHSQC) {
        commonLinksMenu.push({
          label: 'remove pseudo HSQC',
          onClick: () => handleEditPseudoHSQC('remove', commonPseudoLinkHSQC),
        });
      } else {
        commonLinksMenu.push({
          label: 'add pseudo HSQC',
          onClick: () => handleEditPseudoHSQC('add'),
        });
      }
    }

    return commonLinksMenu;
  }, [columnCorrelation, commonLinks, handleEditPseudoHSQC, rowCorrelation]);

  const contentLabel = useMemo(
    () =>
      commonLinks.map((commonLink, i) => (
        <label key={commonLink.id}>
          <label
            style={{
              color:
                commonLink.pseudo === true || commonLink.edited?.moved === true
                  ? 'blue'
                  : 'black',
            }}
          >
            {getAbbreviation(commonLink)}
          </label>
          {i < commonLinks.length - 1 && <label>/</label>}
        </label>
      )),
    [commonLinks],
  );

  const isInViewRow = useInView({ correlation: rowCorrelation });
  const isInViewColumn = useInView({ correlation: columnCorrelation });

  return (
    <ContextMenu
      as="td"
      options={contextMenu}
      onSelect={contextMenuHandler}
      style={{
        backgroundColor: highlightCommonLinks.isActive
          ? '#ff6f0057'
          : isInViewColumn || isInViewRow
            ? '#f5f5dc'
            : 'inherit',
      }}
      title={getTitle(commonLinks)}
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
    >
      {contentLabel}
    </ContextMenu>
  );
}

function getTitle(commonLinks) {
  if (commonLinks?.length === 0) {
    return '';
  }

  return [
    ...new Set(
      commonLinks?.link?.map((link) => {
        return link.experimentType.toUpperCase();
      }),
    ),
  ].join('/');
}

export default AdditionalColumnField;
