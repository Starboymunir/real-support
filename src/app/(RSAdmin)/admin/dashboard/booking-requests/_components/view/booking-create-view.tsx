'use client';

// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from '@/app/(RSAdmin)/admin/routes/paths';
// components
import { useSettingsContext } from '@/app/(RSAdmin)/admin/common/settings';
import CustomBreadcrumbs from '@/app/(RSAdmin)/admin/common/custom-breadcrumbs';
//

import BookingNewEditForm from '../booking-new-edit-form';

// ----------------------------------------------------------------------

export default function BookingCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth='xl'>
      <CustomBreadcrumbs
        heading="Create a new Request"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Requests',
            href: paths.dashboard.requests.root,
          },
          { name: 'New Request' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <BookingNewEditForm />
    </Container>
  );
}
