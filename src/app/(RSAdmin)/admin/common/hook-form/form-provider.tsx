import { FormProvider as Form } from 'react-hook-form';

interface FormProviderProps {
  children: React.ReactNode;
  onSubmit: (e?: any) => void;
  methods: any;
}

export default function FormProvider({ children, onSubmit, methods }: FormProviderProps) {
  return (
    <Form {...methods}>
      <form onSubmit={onSubmit}>{children}</form>
    </Form>
  );
}
