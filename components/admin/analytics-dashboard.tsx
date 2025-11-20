'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Clock, MapPin, AlertTriangle, CheckCircle, BarChart3, PieChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format, subDays, startOfDay, isAfter, isBefore, differenceInDays, differenceInHours } from 'date-fns'
import { CHART_CONFIG } from '@/lib/constants'

const STATUS_COLORS = {
  new: '#3B82F6',
  under_review: '#F59E0B',
  in_progress: '#8B5CF6',
  resolved: '#10B981',
  closed: '#6B7280',
  urgent: '#EF4444',
}

const CATEGORY_LABELS: Record<string, string> = {
  mentor: 'Mentor',
  admin: 'Admin',
  'academic-counsellor': 'Counsellor',
  'working-hub': 'Work Hub',
  peer: 'Peer',
  other: 'Other',
}

const CATEGORY_CODES: Record<string, string> = {
  mentor: 'MNT',
  admin: 'ADM',
  'academic-counsellor': 'CNS',
  'working-hub': 'HUB',
  peer: 'PER',
  other: 'OTH',
}

interface AnalyticsDashboardProps {
  complaints: any[]
  locations: any[]
  role?: string
}

export function AnalyticsDashboard({ complaints, locations, role }: AnalyticsDashboardProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('30')

  // Filter complaints based on selections
  const filteredComplaints = useMemo(() => {
    let filtered = complaints

    // Filter by location
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(c => c.location_id === selectedLocation)
    }

    // Filter by time range
    const daysAgo = parseInt(timeRange)
    const cutoffDate = subDays(new Date(), daysAgo)
    filtered = filtered.filter(c => isAfter(new Date(c.created_at), cutoffDate))

    return filtered
  }, [complaints, selectedLocation, timeRange])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredComplaints.length
    const resolved = filteredComplaints.filter(c => c.status === 'resolved').length
    const pending = filteredComplaints.filter(c =>
      ['new', 'under_review', 'in_progress'].includes(c.status)
    ).length
    const urgent = filteredComplaints.filter(c =>
      (c.status === 'urgent' || c.priority === 'urgent') &&
      c.status !== 'resolved' &&
      c.status !== 'closed'
    ).length

    // Calculate average resolution time
    const resolvedComplaints = filteredComplaints.filter(c =>
      (c.status === 'resolved' || c.status === 'closed') && c.resolved_at
    )

    const avgResolutionTime = resolvedComplaints.length > 0
      ? resolvedComplaints.reduce((sum, c) => {
          const createdAt = new Date(c.created_at)
          const resolvedAt = new Date(c.resolved_at)
          const hours = Math.abs(resolvedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
          return sum + hours
        }, 0) / resolvedComplaints.length
      : 0

    const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : '0'

    return {
      total,
      resolved,
      pending,
      urgent,
      avgResolutionTime: avgResolutionTime.toFixed(1),
      resolutionRate,
    }
  }, [filteredComplaints])

  // Status distribution data
  const statusData = useMemo(() => {
    const statusCounts: Record<string, number> = {
      new: 0,
      under_review: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
      urgent: 0,
    }

    filteredComplaints.forEach(c => {
      if (statusCounts.hasOwnProperty(c.status)) {
        statusCounts[c.status]++
      }
    })

    const allData = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace('_', ' ').toUpperCase(),
      value: count,
      color: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
    }))

    return {
      forPie: allData.filter(item => item.value > 0), // Only non-zero for pie chart
      forBreakdown: allData, // All statuses for breakdown
    }
  }, [filteredComplaints])

  // Category distribution data with all categories
  const categoryData = useMemo(() => {
    // Initialize all categories with zero counts
    const allCategories = Object.keys(CATEGORY_LABELS).reduce((acc, cat) => {
      acc[cat] = { code: CATEGORY_CODES[cat] || cat.toUpperCase(), fullName: CATEGORY_LABELS[cat], value: 0 }
      return acc
    }, {} as Record<string, { code: string; fullName: string; value: number }>)

    // Count complaints for each category
    filteredComplaints.forEach(c => {
      const category = c.category_id || 'other'
      if (allCategories[category]) {
        allCategories[category].value++
      }
    })

    return Object.entries(allCategories)
      .map(([category, data]) => ({
        name: data.code,
        fullName: data.fullName,
        value: data.value,
      }))
      .sort((a, b) => b.value - a.value)
  }, [filteredComplaints])

  // Trend data (last 30 days)
  const trendData = useMemo(() => {
    const days = parseInt(timeRange)
    const data = []

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dateStr = format(date, 'MMM dd')

      const dayComplaints = complaints.filter(c => {
        const complaintDate = startOfDay(new Date(c.created_at))
        const targetDate = startOfDay(date)
        return complaintDate.getTime() === targetDate.getTime()
      })

      data.push({
        date: dateStr,
        total: dayComplaints.length,
        resolved: dayComplaints.filter(c => c.status === 'resolved').length,
        urgent: dayComplaints.filter(c => c.status === 'urgent' || c.priority === 'urgent').length,
      })
    }

    return data
  }, [complaints, timeRange])

  // Location-wise distribution with codenames
  const locationCodeMap: Record<string, string> = {
    'Brocamp Trivandrum': 'TVM',
    'Brocamp Kochi': 'KOC',
    'Brocamp Calicut': 'CLT',
    'Brocamp Bangalore': 'BLR',
    'Brocamp Thrissur': 'TCR',
    'Brocamp Kannur': 'KNR',
  }

  const locationData = useMemo(() => {
    // Initialize all locations with zero counts
    const allLocationCounts = locations.reduce((acc, loc) => {
      const code = locationCodeMap[loc.name] || loc.name.substring(0, 3).toUpperCase()
      acc[code] = { code, fullName: loc.name, total: 0, resolved: 0, pending: 0 }
      return acc
    }, {} as Record<string, { code: string; fullName: string; total: number; resolved: number; pending: number }>)

    // Count complaints for each location
    filteredComplaints.forEach(c => {
      const locationName = c.location?.name
      const code = locationName ? (locationCodeMap[locationName] || locationName.substring(0, 3).toUpperCase()) : 'UNK'

      if (allLocationCounts[code]) {
        allLocationCounts[code].total++
        if (c.status === 'resolved' || c.status === 'closed') {
          allLocationCounts[code].resolved++
        } else if (['new', 'under_review', 'in_progress'].includes(c.status)) {
          allLocationCounts[code].pending++
        }
      }
    })

    type LocationCount = { code: string; fullName: string; total: number; resolved: number; pending: number }
    return (Object.values(allLocationCounts) as LocationCount[]).map((loc) => ({
      name: loc.code,
      ...loc,
    }))
  }, [filteredComplaints, locations])

  // Priority distribution
  const priorityData = useMemo(() => {
    const priorityCounts: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    }

    filteredComplaints.forEach(c => {
      if (priorityCounts.hasOwnProperty(c.priority)) {
        priorityCounts[c.priority]++
      }
    })

    const allData = Object.entries(priorityCounts).map(([priority, count]) => ({
      name: priority.toUpperCase(),
      value: count,
      color: priority === 'urgent' ? '#EF4444' : priority === 'high' ? '#F59E0B' : priority === 'medium' ? '#3B82F6' : '#6B7280',
    }))

    return {
      forPie: allData.filter(item => item.value > 0), // Only non-zero for pie chart
      forBreakdown: allData, // All priorities for breakdown
    }
  }, [filteredComplaints])

  return (
    <div>
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl lg:text-4xl font-black font-mono">Analytics</h1>
              <Button
                asChild
                variant="outline"
                className="hidden lg:flex border-white/20 text-white hover:bg-white/10"
              >
                <Link href={role === 'super_admin' ? '/super-admin' : '/admin'} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
            <p className="text-sm lg:text-base text-gray-400">
              Detailed insights and reports across all Brocamp locations
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                <SelectItem value="all" className="text-white focus:bg-blue-500/20">
                  All Locations
                </SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id} className="text-white focus:bg-blue-500/20">
                    {location.name} - {location.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                <SelectItem value="7" className="text-white focus:bg-blue-500/20">Last 7 Days</SelectItem>
                <SelectItem value="30" className="text-white focus:bg-blue-500/20">Last 30 Days</SelectItem>
                <SelectItem value="90" className="text-white focus:bg-blue-500/20">Last 90 Days</SelectItem>
                <SelectItem value="365" className="text-white focus:bg-blue-500/20">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl lg:rounded-xl border border-white/10 p-4 lg:p-6 aspect-square lg:aspect-auto flex flex-col lg:block">
          <div className="flex items-start justify-between mb-auto lg:mb-2">
            <span className="text-gray-400 text-xs lg:text-sm leading-tight">Total Complaints</span>
            <BarChart3 className="h-4 w-4 lg:h-5 lg:w-5 text-blue-400 flex-shrink-0" />
          </div>
          <div className="flex flex-col items-center lg:items-start justify-center flex-1 lg:flex-none">
            <div className="text-4xl lg:text-3xl font-black font-mono text-white mb-1">{stats.total}</div>
            <div className="text-xs text-gray-500">In selected period</div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl lg:rounded-xl border border-white/10 p-4 lg:p-6 aspect-square lg:aspect-auto flex flex-col lg:block">
          <div className="flex items-start justify-between mb-auto lg:mb-2">
            <span className="text-gray-400 text-xs lg:text-sm leading-tight">Resolution Rate</span>
            <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-400 flex-shrink-0" />
          </div>
          <div className="flex flex-col items-center lg:items-start justify-center flex-1 lg:flex-none">
            <div className="text-4xl lg:text-3xl font-black font-mono text-white mb-1">{stats.resolutionRate}%</div>
            <div className="text-xs text-gray-500 text-center lg:text-left">{stats.resolved} resolved</div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl lg:rounded-xl border border-white/10 p-4 lg:p-6 aspect-square lg:aspect-auto flex flex-col lg:block">
          <div className="flex items-start justify-between mb-auto lg:mb-2">
            <span className="text-gray-400 text-xs lg:text-sm leading-tight">Avg Resolution Time</span>
            <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-purple-400 flex-shrink-0" />
          </div>
          <div className="flex flex-col items-center lg:items-start justify-center flex-1 lg:flex-none">
            <div className="text-4xl lg:text-3xl font-black font-mono text-white mb-1">
              {stats.avgResolutionTime === '0.0' ? 'N/A' : `${stats.avgResolutionTime}h`}
            </div>
            <div className="text-xs text-gray-500 text-center lg:text-left">
              {stats.avgResolutionTime === '0.0' ? 'No resolved' : 'Average hours'}
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl lg:rounded-xl border border-white/10 p-4 lg:p-6 aspect-square lg:aspect-auto flex flex-col lg:block">
          <div className="flex items-start justify-between mb-auto lg:mb-2">
            <span className="text-gray-400 text-xs lg:text-sm leading-tight">Active Urgent Issues</span>
            <AlertTriangle className="h-4 w-4 lg:h-5 lg:w-5 text-red-400 flex-shrink-0" />
          </div>
          <div className="flex flex-col items-center lg:items-start justify-center flex-1 lg:flex-none">
            <div className="text-4xl lg:text-3xl font-black font-mono text-white mb-1">{stats.urgent}</div>
            <div className="text-xs text-gray-500 text-center lg:text-left">Unresolved urgent</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4 lg:space-y-6">
        <div className="overflow-x-auto overflow-y-hidden -mx-4 px-4 lg:mx-0 lg:px-0">
          <TabsList className="bg-white/5 border border-white/10 inline-flex lg:w-full justify-start h-11 lg:h-10">
            <TabsTrigger value="trends" className="data-[state=active]:bg-blue-500/20 text-sm lg:text-sm whitespace-nowrap px-4 lg:px-3">
              Trends
            </TabsTrigger>
            <TabsTrigger value="status" className="data-[state=active]:bg-blue-500/20 text-sm lg:text-sm whitespace-nowrap px-4 lg:px-3">
              Status Distribution
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-blue-500/20 text-sm lg:text-sm whitespace-nowrap px-4 lg:px-3">
              Categories
            </TabsTrigger>
            <TabsTrigger value="locations" className="data-[state=active]:bg-blue-500/20 text-sm lg:text-sm whitespace-nowrap px-4 lg:px-3">
              Locations
            </TabsTrigger>
            <TabsTrigger value="priority" className="data-[state=active]:bg-blue-500/20 text-sm lg:text-sm whitespace-nowrap px-4 lg:px-3">
              Priority
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4 lg:space-y-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 lg:p-6 overflow-hidden">
            <h3 className="text-lg lg:text-xl font-bold font-mono mb-4">Complaint Trends</h3>
            <div className="-mx-4 lg:mx-0">
              <ResponsiveContainer width="100%" height={CHART_CONFIG.defaultHeight}>
                <LineChart data={trendData} margin={CHART_CONFIG.margins.default}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#3B82F6" name="Total" strokeWidth={CHART_CONFIG.lineStrokeWidth} />
                <Line type="monotone" dataKey="resolved" stroke="#10B981" name="Resolved" strokeWidth={CHART_CONFIG.lineStrokeWidth} />
                <Line type="monotone" dataKey="urgent" stroke="#EF4444" name="Urgent" strokeWidth={CHART_CONFIG.lineStrokeWidth} />
              </LineChart>
            </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        {/* Status Distribution Tab */}
        <TabsContent value="status" className="space-y-4 lg:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 lg:p-6 overflow-hidden">
              <h3 className="text-lg lg:text-xl font-bold font-mono mb-4">Status Distribution</h3>
              <ResponsiveContainer width="100%" height={CHART_CONFIG.compactHeight}>
                <RePieChart>
                  <Pie
                    data={statusData.forPie}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={CHART_CONFIG.pieOuterRadius}
                    fill="#8884d8"
                    dataKey="value"
                    style={{ fontSize: '10px' }}
                  >
                    {statusData.forPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 lg:p-6 overflow-hidden">
              <h3 className="text-lg lg:text-xl font-bold font-mono mb-4">Status Breakdown</h3>
              <div className="space-y-3 lg:space-y-4">
                {statusData.forBreakdown.map((status) => (
                  <div key={status.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className={status.value === 0 ? "text-gray-500" : "text-white"}>{status.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold font-mono ${status.value === 0 ? "text-gray-600" : "text-white"}`}>
                        {status.value}
                      </span>
                      <span className="text-gray-400 text-sm">
                        ({stats.total > 0 ? ((status.value / stats.total) * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4 lg:space-y-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 lg:p-6 overflow-hidden">
            <h3 className="text-lg lg:text-xl font-bold font-mono mb-4">Category Distribution</h3>
            <div className="-mx-4 lg:mx-0">
              <ResponsiveContainer width="100%" height={CHART_CONFIG.defaultHeight}>
                <BarChart data={categoryData} margin={CHART_CONFIG.margins.default}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" angle={CHART_CONFIG.xAxisAngle} textAnchor="end" height={CHART_CONFIG.xAxisHeight} />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: any, name: any, props: any) => {
                    // Show full category name in tooltip
                    return [value, props.payload.fullName || name]
                  }}
                  cursor={false}
                />
                <Bar
                  dataKey="value"
                  fill="#3B82F6"
                  name="Complaints"
                  radius={[8, 8, 0, 0]}
                  activeBar={{ fill: '#3B82F6', filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))' }}
                />
              </BarChart>
            </ResponsiveContainer>
            </div>
            <div className="mt-4 text-xs text-gray-400">
              <p className="font-semibold mb-2">Category Codes:</p>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {categoryData.map(cat => (
                  <div key={cat.name}>
                    <span className="font-mono text-blue-400">{cat.name}</span> = {cat.fullName}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-4 lg:space-y-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 lg:p-6 overflow-hidden">
            <h3 className="text-lg lg:text-xl font-bold font-mono mb-4">Location-wise Analysis</h3>
            <div className="-mx-4 lg:mx-0">
              <ResponsiveContainer width="100%" height={CHART_CONFIG.defaultHeight}>
                <BarChart data={locationData} margin={CHART_CONFIG.margins.default}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: any, name: any, props: any) => {
                    // Show full location name in tooltip
                    return [value, props.payload.fullName || name]
                  }}
                  cursor={false}
                />
                <Legend />
                <Bar
                  dataKey="total"
                  fill="#3B82F6"
                  name="Total"
                  radius={[8, 8, 0, 0]}
                  activeBar={{ fill: '#3B82F6', filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))' }}
                />
                <Bar
                  dataKey="resolved"
                  fill="#10B981"
                  name="Resolved"
                  radius={[8, 8, 0, 0]}
                  activeBar={{ fill: '#10B981', filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.8))' }}
                />
                <Bar
                  dataKey="pending"
                  fill="#F59E0B"
                  name="Pending"
                  radius={[8, 8, 0, 0]}
                  activeBar={{ fill: '#F59E0B', filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.8))' }}
                />
              </BarChart>
            </ResponsiveContainer>
            </div>
            <div className="mt-4 text-xs text-gray-400">
              <p className="font-semibold mb-2">Location Codes:</p>
              <div className="grid grid-cols-2 gap-2">
                {locationData.map(loc => (
                  <div key={loc.name}>
                    <span className="font-mono text-blue-400">{loc.name}</span> = {loc.fullName}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Priority Tab */}
        <TabsContent value="priority" className="space-y-4 lg:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 lg:p-6 overflow-hidden">
              <h3 className="text-lg lg:text-xl font-bold font-mono mb-4">Priority Distribution</h3>
              <ResponsiveContainer width="100%" height={CHART_CONFIG.compactHeight}>
                <RePieChart>
                  <Pie
                    data={priorityData.forPie}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={CHART_CONFIG.pieOuterRadius}
                    fill="#8884d8"
                    dataKey="value"
                    style={{ fontSize: '10px' }}
                  >
                    {priorityData.forPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 lg:p-6 overflow-hidden">
              <h3 className="text-lg lg:text-xl font-bold font-mono mb-4">Priority Breakdown</h3>
              <div className="space-y-3 lg:space-y-4">
                {priorityData.forBreakdown.map((priority) => (
                  <div key={priority.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: priority.color }}
                      />
                      <span className={priority.value === 0 ? "text-gray-500" : "text-white"}>{priority.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold font-mono ${priority.value === 0 ? "text-gray-600" : "text-white"}`}>
                        {priority.value}
                      </span>
                      <span className="text-gray-400 text-sm">
                        ({stats.total > 0 ? ((priority.value / stats.total) * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
