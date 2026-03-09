import { forwardRef } from 'react';
import Link, { LinkProps } from 'next/link';

const RouterLink = forwardRef(({ ...other }: LinkProps, ref: any) => <Link ref={ref} {...other} />);

export default RouterLink;
