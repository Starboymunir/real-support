'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Button } from '@/components/ui/button';
import {
  DriverSchema,
  TDriverSchemaValidator,
} from '@/lib/validators/driver-validator';
import { Driver } from '@prisma/client';

interface IDriverUpdateForm {
  closeModal: () => void;
  driver: Driver;
}

const DriverUpdateForm: React.FC<IDriverUpdateForm> = ({
  closeModal,
  driver,
}) => {
  const [loading, setLoading] = useState(false);
  console.log('data..........', driver);

  const defaultValues = {};
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TDriverSchemaValidator>({
    resolver: zodResolver(DriverSchema),
    defaultValues,
  });

  const onSubmit = () => {};

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-2xl font-poppins font-bold text-center mb-10 text-white">
        Driver Info Update
      </h1>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
        <div className="w-full md:w-3/4 space-y-1">
          <Label className="font-semibold text-white">NI Number *</Label>
          <Input
            {...register('nationalInsuranceNumber')}
            placeholder="First Name"
            className={cn('w-full outline-none p-4 rounded-sm', {
              'focus-visible:ring-red-500': errors.nationalInsuranceNumber,
            })}
          />
        </div>
        <div className="col-span-1 sm:col-span-2 md:col-span-2 place-self-end">
          <Button disabled={loading} type="submit">
            Update Driver info
          </Button>
        </div>
      </div>
    </form>
  );
};

export default DriverUpdateForm;
