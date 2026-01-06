"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Smartphone, Monitor } from "lucide-react";

const getCountryFlagEmoji = (countryCode) => {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};

const COLORS_OUTER = [
  "#003f5c",
  "#444e86",
  "#955196",
  "#dd5182",
  "#ff6e54",
  "#ffa600",
];

const DemographicsCard = ({ data, deviceData, loading = false }) => {
  if (loading) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
            User Demographics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!data || !deviceData) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
            User Demographics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const deviceDistribution = deviceData.distribution || [];
  const countries = data.countries || [];

  // Ensure all device types are present (even if 0%)
  const defaultDevices = [
    { device: "mobile", percentage: 0 },
    { device: "desktop", percentage: 0 },
  ];

  const deviceMap = new Map(
    deviceDistribution.map((d) => [d.device.toLowerCase(), d])
  );

  const normalizedDevices = defaultDevices.map(
    (d) => deviceMap.get(d.device) || d
  );

  // Transform countries data for pie chart
  const countriesChartData = countries.map((c) => ({
    name: `${getCountryFlagEmoji(c.country)} ${c.country.toUpperCase()}`,
    value: parseFloat(c.percentage.toFixed(1)),
  }));

  const CountriesTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 shadow-lg">
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            {payload[0].payload.name}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {payload[0].payload.value}%
          </p>
        </div>
      );
    }
    return null;
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType.toLowerCase()) {
      case "mobile":
        return <Smartphone className="w-6 h-6" />;
      case "desktop":
        return <Monitor className="w-6 h-6" />;
      default:
        return <Monitor className="w-6 h-6" />;
    }
  };

  if (countriesChartData.length === 0) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
            User Demographics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-500">
            No demographics data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
          User Demographics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-8">
          {/* Device Distribution - Top */}
          {normalizedDevices.length > 0 && (
            <div className="flex items-center justify-center gap-8">
              {normalizedDevices.map((device, index) => (
                <React.Fragment key={device.device}>
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-slate-600 dark:text-slate-400">
                      {getDeviceIcon(device.device)}
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {device.percentage.toFixed(0)}%
                    </div>
                    <div className="text-xs text-slate-500 capitalize">
                      {device.device}
                    </div>
                  </div>
                  {index < normalizedDevices.length - 1 && (
                    <div className="h-16 w-px bg-slate-200 dark:bg-slate-700" />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Separator */}
          {normalizedDevices.length > 0 && countriesChartData.length > 0 && (
            <div className="h-px bg-slate-200 dark:bg-slate-700" />
          )}

          {/* Countries Pie Chart - Bottom */}
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              Top Locations
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={countriesChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ value }) => `${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {countriesChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS_OUTER[index % COLORS_OUTER.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CountriesTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ paddingTop: "20px" }}
                  formatter={(value) => (
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DemographicsCard;
