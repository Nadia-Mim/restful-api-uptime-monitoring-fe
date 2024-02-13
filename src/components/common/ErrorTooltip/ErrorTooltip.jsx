import CIcon from '@coreui/icons-react';
import { CTooltip } from '@coreui/react';
import React from 'react';


const ErrorTooltip = ({ content, placement }) => {
    return (
        <CTooltip
            content={content?.data?.message ? content?.data?.message : content?.charAt(0)?.toUpperCase() + content?.slice(1)}
            placement={placement}
            style={{ backgroundColor: 'red', color: 'white' }}
        >
            <CIcon src="https://icon-library.com/images/error-icon-transparent/error-icon-transparent-5.jpg" style={{ height: 20, width: 20 }} />
        </CTooltip>

    )
}

export default ErrorTooltip
