// MUI v7: loadingButtonClasses removed from @mui/lab — use stable class names directly
const loadingButtonClasses = {
  loadingIndicatorStart: 'MuiLoadingButton-loadingIndicatorStart',
  loadingIndicatorEnd: 'MuiLoadingButton-loadingIndicatorEnd',
};

// ----------------------------------------------------------------------

export default function LoadingButton(theme) {
  return {
    MuiLoadingButton: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.variant === 'soft' && {
            [`& .${loadingButtonClasses.loadingIndicatorStart}`]: {
              left: 10,
            },
            [`& .${loadingButtonClasses.loadingIndicatorEnd}`]: {
              right: 14,
            },
            ...(ownerState.size === 'small' && {
              [`& .${loadingButtonClasses.loadingIndicatorStart}`]: {
                left: 10,
              },
              [`& .${loadingButtonClasses.loadingIndicatorEnd}`]: {
                right: 10,
              },
            }),
          }),
        }),
      },
    },
  };
}
