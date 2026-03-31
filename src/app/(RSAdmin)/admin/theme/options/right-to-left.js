import PropTypes from 'prop-types';
import { useEffect } from 'react';
// rtl
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
// emotion
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

// ----------------------------------------------------------------------

export default function RTL({ children, themeDirection }) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.dir = themeDirection;
    }
  }, [themeDirection]);

  if (themeDirection === 'rtl' && typeof window !== 'undefined') {
    const cacheRtl = createCache({
      key: 'rtl',
      prepend: true,
      // https://github.com/styled-components/stylis-plugin-rtl/issues/35
      stylisPlugins: [prefixer, rtlPlugin],
    });
    return <CacheProvider value={cacheRtl}>{children}</CacheProvider>;
  }

  return <>{children}</>;
}

RTL.propTypes = {
  children: PropTypes.node,
  themeDirection: PropTypes.oneOf(['rtl', 'ltr']),
};

// ----------------------------------------------------------------------

export function direction(themeDirection) {
  const theme = {
    direction: themeDirection,
  };

  return theme;
}
