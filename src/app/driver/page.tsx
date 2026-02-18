'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  User,
  Car,
  FileText,
  Check,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Hash,
  Heart,
  Building2,
} from 'lucide-react';

const steps = [
  { label: 'Personal Info', icon: User },
  { label: 'Vehicle Details', icon: Car },
  { label: 'Documents', icon: FileText },
];

export default function DriverRegistrationPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: 'driver@rscab.co.uk',
    phone: '',
    dob: '',
    niNumber: '',
    taxId: '',
    address: '',
    city: '',
    postcode: '',
    bio: '',
    hobby: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <DashboardLayout role="driver" userName="New Driver" pageTitle="Driver Registration">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: '33%' }}
          />
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          {steps.map((step, i) => {
            const StepIcon = step.icon;
            const isActive = i === 0;
            const isDone = false;

            return (
              <div key={step.label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      isDone
                        ? 'bg-secondary text-white shadow-lg shadow-secondary/30'
                        : isActive
                        ? 'bg-gradient-to-br from-primary to-primary-light text-white shadow-lg shadow-primary/30'
                        : 'bg-gray-100 text-text-muted border-2 border-gray-200'
                    }`}
                  >
                    {isDone ? <Check size={20} /> : <StepIcon size={20} />}
                  </div>
                  <span
                    className={`text-xs font-semibold whitespace-nowrap ${
                      isActive ? 'text-primary' : isDone ? 'text-secondary' : 'text-text-muted'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 mx-4">
                    <div
                      className={`h-0.5 rounded-full ${
                        isDone ? 'bg-secondary' : 'bg-gray-200'
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary">Personal Information</h2>
            <p className="text-text-secondary mt-1">
              Tell us about yourself to get started as an RS CAB driver
            </p>
          </div>

          <form className="space-y-6">
            {/* First Name / Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                name="firstName"
                icon={User}
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <Input
                label="Last Name"
                name="lastName"
                icon={User}
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email / Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Email Address"
                name="email"
                type="email"
                icon={Mail}
                value={formData.email}
                disabled
              />
              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                icon={Phone}
                placeholder="+44 7700 900000"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            {/* DOB / NI / Tax ID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Date of Birth"
                name="dob"
                type="date"
                icon={Calendar}
                value={formData.dob}
                onChange={handleChange}
                required
              />
              <Input
                label="NI Number"
                name="niNumber"
                icon={Hash}
                placeholder="QQ 12 34 56 C"
                value={formData.niNumber}
                onChange={handleChange}
                required
              />
              <Input
                label="Tax ID"
                name="taxId"
                icon={Hash}
                placeholder="Enter tax ID"
                value={formData.taxId}
                onChange={handleChange}
              />
            </div>

            {/* Address */}
            <Input
              label="Address"
              name="address"
              icon={MapPin}
              placeholder="Enter your full address"
              value={formData.address}
              onChange={handleChange}
              required
            />

            {/* City / Postcode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="City"
                name="city"
                icon={Building2}
                placeholder="Enter your city"
                value={formData.city}
                onChange={handleChange}
                required
              />
              <Input
                label="Postcode"
                name="postcode"
                icon={MapPin}
                placeholder="Enter postcode"
                value={formData.postcode}
                onChange={handleChange}
                required
              />
            </div>

            {/* Bio */}
            <div className="w-full">
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Bio
              </label>
              <textarea
                name="bio"
                className="input-field resize-none"
                rows={4}
                placeholder="Tell riders a bit about yourself..."
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            {/* Hobby */}
            <Input
              label="Hobby"
              name="hobby"
              icon={Heart}
              placeholder="What do you enjoy doing?"
              value={formData.hobby}
              onChange={handleChange}
            />

            {/* Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <Button variant="outline" href="/login">
                Cancel
              </Button>
              <Button variant="green" href="/driver/vehicle">
                Next: Vehicle Details
                <Car size={18} />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
