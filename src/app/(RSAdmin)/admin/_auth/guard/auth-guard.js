// import PropTypes from 'prop-types';
// import { useEffect, useCallback, useState } from 'react';
// // routes
// import { paths } from '@/app/(RSAdmin)/admin/routes/paths';
// import { useRouter } from '@/app/(RSAdmin)/admin/routes/hook';
// //
// import { useAuthContext } from '../hooks';
// import { LoadingScreen } from '@/app/(RSAdmin)/admin/common/loading-screen';
//
// // ----------------------------------------------------------------------
//
// const loginPaths = {
//   jwt: paths.auth.jwt.login,
//   auth0: paths.auth.auth0.login,
//   amplify: paths.auth.amplify.login,
//   firebase: paths.auth.firebase.login,
// };
//
// // ----------------------------------------------------------------------
//
// export default function AuthGuard({ children }) {
//   const router = useRouter();
//
//   const { authenticated, method, loading } = useAuthContext();
//
//   const [checked, setChecked] = useState(false);
//
//   const check = useCallback(() => {
//     if (!authenticated) {
//       const searchParams = new URLSearchParams({
//         returnTo: window.location.pathname,
//       }).toString();
//
//       const loginPath = loginPaths[method];
//
//       const href = `${loginPath}?${searchParams}`;
//
//       router.replace(href);
//     } else {
//       setChecked(true);
//     }
//   }, [authenticated, method, router]);
//
//   useEffect(() => {
//     check();
//   }, []);
//
//   if (!checked) {
//     return null;
//   }
//
//   return <>{
//     loading ? (
//       <LoadingScreen />
//     ) : (
//       <>
//         {children}
//       </>
//     )
//   }</>;
// }
//
// AuthGuard.propTypes = {
//   children: PropTypes.node,
// };
