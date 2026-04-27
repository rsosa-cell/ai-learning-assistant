import React, { useEffect, useState } from "react";
import Spinner from "../../components/common/Spinner";
import progressService from "../../services/progressService";
import toast from "react-hot-toast";
import {
  FileText,
  BookOpen,
  BrainCircuit,
  TrendingUp,
  Clock,
} from "lucide-react";

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await progressService.getDashboardData();
        console.log("Data__getDashboardData", data);
        setDashboardData(data.data);
      } catch (error) {
        toast.error("Failed to fetch dashboard data.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Spinner />;

  if (!dashboardData || !dashboardData.overview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-600 text-sm">
            No dashboard data available
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Documents",
      value: dashboardData.overview.totalDocuments,
      icon: FileText,
      gradient: "from-blue-400 to-cyan-500",
    },
    {
      label: "Total Flashcards",
      value: dashboardData.overview.totalFlashcards,
      icon: BookOpen,
      gradient: "from-purple-400 to-pink-500",
    },
    {
      label: "Total Quizzes",
      value: dashboardData.overview.totalQuizzes,
      icon: BrainCircuit,
      gradient: "from-emerald-400 to-teal-500",
    },
  ];

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-slate-900 mb-2">
          Dashboard
        </h1>
        <p className="text-slate-500 text-sm">
          Track your learning progress
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow border"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-slate-500">
                {stat.label}
              </span>
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-lg bg-linear-to-br ${stat.gradient}`}
              >
                <stat.icon className="text-white w-5 h-5" />
              </div>
            </div>

            <p className="text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </h2>

        {dashboardData.recentActivity &&
        (dashboardData.recentActivity.documents.length > 0 ||
          dashboardData.recentActivity.quizzes.length > 0) ? (
          <div className="space-y-3">
            {[
              ...(dashboardData.recentActivity.documents || []).map(
                (doc) => ({
                  id: doc._id,
                  description: doc.title,
                  timestamp: doc.lastAccessed,
                  type: "document",
                })
              ),
              ...(dashboardData.recentActivity.quizzes || []).map(
                (quiz) => ({
                  id: quiz._id,
                  description: quiz.title,
                  timestamp: quiz.completedAt,
                  type: "quiz",
                })
              ),
            ]
              .sort(
                (a, b) =>
                  new Date(b.timestamp) - new Date(a.timestamp)
              )
              .map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="p-3 border rounded-lg flex justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {activity.type === "document"
                        ? "Viewed Document:"
                        : "Completed Quiz:"}{" "}
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            No recent activity yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;