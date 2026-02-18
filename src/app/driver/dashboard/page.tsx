'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import {
  DollarSign,
  Car,
  TrendingUp,
  Star,
  CheckCircle,
  Target,
  Power,
  MapPin,
  Clock,
  Navigation,
  Sunrise,
  Award,
  Map,
  ThumbsUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const statCards = [
  { label: "Today's Earnings", value: '£145.50', change: '+12%', up: true, icon: DollarSign, color: 'bg-green-50 text-green-600' },
  { label: "Today's Rides", value: '8', change: '+2', up: true, icon: Car, color: 'bg-blue-50 text-blue-600' },
  { label: 'Weekly Earnings', value: '£823.00', change: '+8%', up: true, icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
  { label: 'Rating', value: '4.9★', change: '+0.1', up: true, icon: Star, color: 'bg-yellow-50 text-yellow-600' },
  { label: 'Acceptance Rate', value: '95%', change: '+2%', up: true, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
  { label: 'Completion Rate', value: '98%', change: '+1%', up: true, icon: Target, color: 'bg-indigo-50 text-indigo-600' },
];

const weeklyData = [
  { day: 'Mon', amount: 95, height: 58 },
  { day: 'Tue', amount: 120, height: 73 },
  { day: 'Wed', amount: 145, height: 88 },
  { day: 'Thu', amount: 110, height: 67 },
  { day: 'Fri', amount: 165, height: 100 },
  { day: 'Sat', amount: 135, height: 82 },
  { day: 'Sun', amount: 53, height: 32 },
];

const recentRides = [
  { time: '2:30 PM', from: 'Baker Street', to: 'Canary Wharf', fare: '£24.50', rating: 5 },
  { time: '1:15 PM', from: 'Paddington', to: 'Liverpool Street', fare: '£18.00', rating: 5 },
  { time: '11:45 AM', from: 'King\'s Cross', to: 'Westminster', fare: '£15.50', rating: 4 },
  { time: '10:20 AM', from: 'Shoreditch', to: 'Chelsea', fare: '£22.00', rating: 5 },
  { time: '9:00 AM', from: 'Hackney', to: 'Mayfair', fare: '£19.80', rating: 5 },
];

const driverTips = [
  { title: 'Peak Hours', description: 'Drive during 7-9 AM and 5-8 PM for more requests and surge pricing', icon: Sunrise, color: 'bg-orange-50 text-orange-600' },
  { title: 'Keep Rating High', description: 'Maintain cleanliness, be polite, and offer water to passengers', icon: Award, color: 'bg-yellow-50 text-yellow-600' },
  { title: 'Hotspot Areas', description: 'Position near airports, stations, and event venues for quick pickups', icon: Map, color: 'bg-blue-50 text-blue-600' },
  { title: 'Accept More Rides', description: 'Higher acceptance rate unlocks bonuses and priority ride matching', icon: ThumbsUp, color: 'bg-green-50 text-green-600' },
];

export default function DriverDashboardPage() {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <DashboardLayout role="driver" userName="James Wilson" pageTitle="Dashboard">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Welcome back, <span className="gradient-text">James</span>
            </h1>
            <p className="text-text-secondary mt-1">
              {isOnline
                ? "You're online and receiving ride requests"
                : "You're offline. Go online to start receiving rides"}
            </p>
          </div>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer ${
              isOnline
                ? 'bg-secondary/10 text-secondary border border-secondary/30 hover:bg-secondary/20'
                : 'bg-gray-100 text-text-muted border border-gray-200 hover:bg-gray-200'
            }`}
          >
            <span className="relative flex h-3 w-3">
              {isOnline && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isOnline ? 'bg-secondary' : 'bg-gray-400'
                }`}
              />
            </span>
            <Power size={18} />
            {isOnline ? 'Online' : 'Offline'}
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {statCards.map((stat) => {
            const StatIcon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 card-hover"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}
                  >
                    <StatIcon size={20} />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                      stat.up
                        ? 'bg-green-50 text-green-600'
                        : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {stat.change}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-text-primary tabular-nums">{stat.value}</p>
                  <p className="text-sm text-text-muted mt-0.5">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Ride + Weekly Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Ride */}
          {isOnline && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-text-primary">Current Ride</h3>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-600">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  In Progress
                </span>
              </div>

              {/* Passenger */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold text-sm">
                  SP
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-text-primary">Sarah Parker</p>
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span>4.8</span>
                    <span className="text-gray-300">•</span>
                    <span>142 rides</span>
                  </div>
                </div>
              </div>

              {/* Route */}
              <div className="relative pl-6 mb-5 space-y-4">
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-secondary to-accent" />
                <div className="relative">
                  <div className="absolute -left-[18px] top-1 w-3 h-3 rounded-full bg-secondary border-2 border-white shadow" />
                  <p className="text-sm text-text-muted">Pickup</p>
                  <p className="font-semibold text-text-primary">Baker Street</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[18px] top-1 w-3 h-3 rounded-full bg-accent border-2 border-white shadow" />
                  <p className="text-sm text-text-muted">Drop-off</p>
                  <p className="font-semibold text-text-primary">Canary Wharf</p>
                </div>
              </div>

              {/* Ride Stats */}
              <div className="grid grid-cols-3 gap-3 mb-5 p-3 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <p className="text-lg font-bold text-text-primary">£24.50</p>
                  <p className="text-xs text-text-muted">Est. Fare</p>
                </div>
                <div className="text-center border-x border-gray-200">
                  <p className="text-lg font-bold text-text-primary">18 min</p>
                  <p className="text-xs text-text-muted">ETA</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-text-primary">7.2 mi</p>
                  <p className="text-xs text-text-muted">Distance</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <Navigation size={16} />
                  Navigate
                </Button>
                <Button variant="green" className="flex-1">
                  <CheckCircle size={16} />
                  Complete
                </Button>
              </div>
            </div>
          )}

          {/* Weekly Earnings Chart */}
          <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${!isOnline ? 'lg:col-span-2' : ''}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-text-primary">Weekly Earnings</h3>
              <span className="text-sm text-text-muted">This Week</span>
            </div>
            <div className="flex items-end justify-between gap-3 h-48">
              {weeklyData.map((d) => (
                <div key={d.day} className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-xs font-semibold text-text-primary tabular-nums">
                    £{d.amount}
                  </span>
                  <div
                    className="w-full rounded-lg bg-gradient-to-t from-primary to-secondary/80 transition-all duration-500 hover:opacity-80"
                    style={{ height: `${d.height}%` }}
                  />
                  <span className="text-xs text-text-muted font-medium">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Rides Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-text-primary">Recent Rides</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Fare</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentRides.map((ride, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-text-muted" />
                        <span className="text-sm font-medium text-text-primary">{ride.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin size={14} className="text-secondary shrink-0" />
                        <span className="text-text-primary">{ride.from}</span>
                        <span className="text-text-muted">→</span>
                        <span className="text-text-primary">{ride.to}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-text-primary tabular-nums">{ride.fare}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: ride.rating }).map((_, s) => (
                          <Star key={s} size={14} className="text-yellow-500 fill-yellow-500" />
                        ))}
                        {Array.from({ length: 5 - ride.rating }).map((_, s) => (
                          <Star key={s} size={14} className="text-gray-200" />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Driver Tips */}
        <div>
          <h3 className="text-lg font-bold text-text-primary mb-4">Driver Tips</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {driverTips.map((tip) => {
              const TipIcon = tip.icon;
              return (
                <div
                  key={tip.title}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 card-hover"
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${tip.color}`}
                  >
                    <TipIcon size={20} />
                  </div>
                  <h4 className="font-semibold text-text-primary mb-1">{tip.title}</h4>
                  <p className="text-sm text-text-muted leading-relaxed">{tip.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
