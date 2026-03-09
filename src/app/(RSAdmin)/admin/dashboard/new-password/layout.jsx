'use client';

import PropTypes from 'prop-types';

// ----------------------------------------------------------------------

export default function Layout({ children }) {
  return <>{children}</>;
}

Layout.propTypes = {
  children: PropTypes.node,
};
