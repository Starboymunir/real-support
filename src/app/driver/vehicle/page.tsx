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
  Upload,
  Palette,
  Hash,
  Users,
  ChevronDown,
  ArrowLeft,
} from 'lucide-react';

const steps = [
  { label: 'Personal Info', icon: User },
  { label: 'Vehicle Details', icon: Car },
  { label: 'Documents', icon: FileText },
];

const carMakes = [
  'Toyota', 'Honda', 'BMW', 'Mercedes', 'Ford', 'Volkswagen',
  'Audi', 'Hyundai', 'Kia', 'Nissan', 'Peugeot', 'Vauxhall', 'Skoda', 'SEAT', 'Tesla',
];

const vehicleTypes = ['Sedan', 'SUV', 'Van', 'Luxury'];

const years = Array.from({ length: 20 }, (_, i) => 2026 - i);

export default function VehiclePage() {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    regNumber: '',
    vehicleType: '',
    seats: '',
  });
  const [wheelchairAccessible, setWheelchairAccessible] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <DashboardLayout role="driver" userName="New Driver" pageTitle="Vehicle Registration">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: '66%' }}
          />
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          {steps.map((step, i) => {
            const StepIcon = step.icon;
            const isActive = i === 1;
            const isDone = i < 1;

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
                        i < 1 ? 'bg-secondary' : 'bg-gray-200'
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
            <h2 className="text-2xl font-bold text-text-primary">Vehicle Information</h2>
            <p className="text-text-secondary mt-1">
              Provide details about the vehicle you&apos;ll be driving
            </p>
          </div>

          <form className="space-y-6">
            {/* Make / Model */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="w-full">
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Make
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                    <Car size={18} />
                  </span>
                  <select
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    className="input-field appearance-none cursor-pointer pl-10 pr-10"
                  >
                    <option value="">Select make</option>
                    {carMakes.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                    <ChevronDown size={18} />
                  </span>
                </div>
              </div>
              <Input
                label="Model"
                name="model"
                icon={Car}
                placeholder="e.g. Corolla, Civic"
                value={formData.model}
                onChange={handleChange}
                required
              />
            </div>

            {/* Year / Color */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="w-full">
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Year
                </label>
                <div className="relative">
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="input-field appearance-none cursor-pointer pr-10"
                  >
                    <option value="">Select year</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                    <ChevronDown size={18} />
                  </span>
                </div>
              </div>
              <Input
                label="Color"
                name="color"
                icon={Palette}
                placeholder="e.g. Black, White, Silver"
                value={formData.color}
                onChange={handleChange}
                required
              />
            </div>

            {/* Reg Number / Vehicle Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Registration Number"
                name="regNumber"
                icon={Hash}
                placeholder="AB12 CDE"
                value={formData.regNumber}
                onChange={handleChange}
                required
              />
              <div className="w-full">
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Vehicle Type
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                    <Car size={18} />
                  </span>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className="input-field appearance-none cursor-pointer pl-10 pr-10"
                  >
                    <option value="">Select type</option>
                    {vehicleTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                    <ChevronDown size={18} />
                  </span>
                </div>
              </div>
            </div>

            {/* Seats / Wheelchair */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Number of Seats"
                name="seats"
                type="number"
                icon={Users}
                placeholder="4"
                value={formData.seats}
                onChange={handleChange}
                required
              />
              <div className="w-full">
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Wheelchair Accessible
                </label>
                <button
                  type="button"
                  onClick={() => setWheelchairAccessible(!wheelchairAccessible)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-[1.5px] transition-all duration-200 cursor-pointer ${
                    wheelchairAccessible
                      ? 'border-secondary bg-secondary/5 text-secondary'
                      : 'border-gray-200 bg-white text-text-secondary hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium">
                    {wheelchairAccessible ? 'Yes — Accessible' : 'No — Not Accessible'}
                  </span>
                  <div
                    className={`w-12 h-6 rounded-full flex items-center transition-all duration-200 ${
                      wheelchairAccessible ? 'bg-secondary justify-end' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <div className="w-5 h-5 bg-white rounded-full shadow mx-0.5" />
                  </div>
                </button>
              </div>
            </div>

            {/* Vehicle Photo Upload */}
            <div className="w-full">
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Vehicle Photo
              </label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-secondary/50 hover:bg-secondary/5 transition-all duration-300 cursor-pointer group">
                <div className="w-14 h-14 rounded-full bg-gray-100 group-hover:bg-secondary/10 flex items-center justify-center mx-auto mb-4 transition-colors">
                  <Upload size={24} className="text-text-muted group-hover:text-secondary transition-colors" />
                </div>
                <p className="text-text-primary font-semibold mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-text-muted text-sm">
                  PNG, JPG or WEBP (max. 5MB)
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <Button variant="outline" href="/driver">
                <ArrowLeft size={18} />
                Back
              </Button>
              <Button variant="green" href="/driver/documents">
                Next: Documents
                <FileText size={18} />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
