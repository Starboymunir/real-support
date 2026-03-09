"use client";

import Loader from "@/components/loader";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { useAuthContext } from "@/providers/auth-providers";
import { redirect, usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { loading, user, driverProfile, mode } = useAuthContext();

  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname.match(/^\/(login|register)$/);
  const isDashboardPage =
    pathname.startsWith("/rider") || pathname.startsWith("/driver");

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (user && isAuthPage) {
      router.push("/");
    }
  }, [user, isAuthPage, router]);

  if (loading) {
    return <Loader />;
  }
  // Allow access to public pages without authentication
  if (!isAuthPage && !isDashboardPage) {
    return <>{children}</>;
  }

  if (!loading && !user) {
    redirect("/login");
  }
  
  return (
    <MaxWidthWrapper>
      {mode !== "PASSENGER" &&
        driverProfile &&
        driverProfile.status !== "ACTIVE" && (
          <div
            id="alert-border-2"
            className="flex items-center p-4 mb-4 text-red-800 border-t-4 border-red-300 bg-red-50 dark:text-red-400 dark:bg-gray-800 dark:border-red-800"
            role="alert"
          >
            <svg
              className="flex-shrink-0 w-4 h-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
            <div className="ms-3 text-sm font-medium">
              Your Driver Profile is {driverProfile.status}
            </div>
          </div>
        )}

      {children}
    </MaxWidthWrapper>
  );
};
// };

export default AuthGuard;

// import React, { useEffect } from "react";
// import { Amplify } from "aws-amplify";
// import {
//   Authenticator,
//   Heading,
//   Radio,
//   RadioGroupField,
//   useAuthenticator,
//   View,
// } from "@aws-amplify/ui-react";
// import "@aws-amplify/ui-react/styles.css";
// import { useRouter, usePathname } from "next/navigation";

// // https://docs.amplify.aws/gen1/javascript/tools/libraries/configure-categories/
// Amplify.configure({
//   Auth: {
//     Cognito: {
//       userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!,
//       userPoolClientId:
//         process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID!,
//     },
//   },
// });

// const components = {
//   Header() {
//     return (
//       <View className="mt-4 mb-7">
//         <Heading level={3} className="!text-2xl !font-bold">
//           RENT
//           <span className="text-secondary-500 font-light hover:!text-primary-300">
//             IFUL
//           </span>
//         </Heading>
//         <p className="text-muted-foreground mt-2">
//           <span className="font-bold">Welcome!</span> Please sign in to continue
//         </p>
//       </View>
//     );
//   },
//   SignIn: {
//     Footer() {
//       const { toSignUp } = useAuthenticator();
//       return (
//         <View className="text-center mt-4">
//           <p className="text-muted-foreground">
//             Don&apos;t have an account?{" "}
//             <button
//               onClick={toSignUp}
//               className="text-primary hover:underline bg-transparent border-none p-0"
//             >
//               Sign up here
//             </button>
//           </p>
//         </View>
//       );
//     },
//   },
//   SignUp: {
//     FormFields() {
//       const { validationErrors } = useAuthenticator();

//       return (
//         <>
//           <Authenticator.SignUp.FormFields />
//           <RadioGroupField
//             legend="Role"
//             name="custom:role"
//             errorMessage={validationErrors?.["custom:role"]}
//             hasError={!!validationErrors?.["custom:role"]}
//             isRequired
//           >
//             <Radio value="tenant">Tenant</Radio>
//             <Radio value="manager">Manager</Radio>
//           </RadioGroupField>
//         </>
//       );
//     },

//     Footer() {
//       const { toSignIn } = useAuthenticator();
//       return (
//         <View className="text-center mt-4">
//           <p className="text-muted-foreground">
//             Already have an account?{" "}
//             <button
//               onClick={toSignIn}
//               className="text-primary hover:underline bg-transparent border-none p-0"
//             >
//               Sign in
//             </button>
//           </p>
//         </View>
//       );
//     },
//   },
// };

// const formFields = {
//   signIn: {
//     username: {
//       placeholder: "Enter your email",
//       label: "Email",
//       isRequired: true,
//     },
//     password: {
//       placeholder: "Enter your password",
//       label: "Password",
//       isRequired: true,
//     },
//   },
//   signUp: {
//     username: {
//       order: 1,
//       placeholder: "Choose a username",
//       label: "Username",
//       isRequired: true,
//     },
//     email: {
//       order: 2,
//       placeholder: "Enter your email address",
//       label: "Email",
//       isRequired: true,
//     },
//     password: {
//       order: 3,
//       placeholder: "Create a password",
//       label: "Password",
//       isRequired: true,
//     },
//     confirm_password: {
//       order: 4,
//       placeholder: "Confirm your password",
//       label: "Confirm Password",
//       isRequired: true,
//     },
//   },
// };

// const Auth = ({ children }: { children: React.ReactNode }) => {
//   const { user } = useAuthenticator((context) => [context.user]);
//   const router = useRouter();
//   const pathname = usePathname();

//   const isAuthPage = pathname.match(/^\/(signin|signup)$/);
//   const isDashboardPage =
//     pathname.startsWith("/manager") || pathname.startsWith("/tenants");

//   // Redirect authenticated users away from auth pages
//   useEffect(() => {
//     if (user && isAuthPage) {
//       router.push("/");
//     }
//   }, [user, isAuthPage, router]);

//   // Allow access to public pages without authentication
//   if (!isAuthPage && !isDashboardPage) {
//     return <>{children}</>;
//   }

//   return (
//     <div className="h-full">
//       <Authenticator
//         initialState={pathname.includes("signup") ? "signUp" : "signIn"}
//         components={components}
//         formFields={formFields}
//       >
//         {() => <>{children}</>}
//       </Authenticator>
//     </div>
//   );
// };

// export default Auth;
