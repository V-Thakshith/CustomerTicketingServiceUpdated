import React, { useEffect, useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement } from 'chart.js';
import api from '../api';

// Register necessary components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement);

const ManagerTicketChart = () => {
  const [chartData, setChartData] = useState(null);
  const [todayData, setTodayData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [response, todayResponse] = await Promise.all([
          api.get('/users/getAllTicketsCounts'),
          api.get('/users/getAllTicketsCountsToday')
        ]);

        // Destructure and set data with default values if any field is missing
        const { totalTickets = 0, resolvedTickets = 0, inProgressTickets = 0, openTickets = 0 } = response.data;
        const { resolvedTickets: todayResolved = 0, inProgressTickets: todayInProgress = 0, openTickets: todayOpen = 0 } = todayResponse.data;

        setChartData({
          
          resolvedTickets,
          inProgressTickets,
          openTickets
        });

        setTodayData({
          resolvedTickets: todayResolved,
          inProgressTickets: todayInProgress,
          openTickets: todayOpen
        });

      } catch (error) {
        console.error("Error fetching ticket data:", error);
      }
    };

    fetchData();
  }, []);

  const pieData = {
    labels: [ 'Resolved Tickets', 'In Progress Tickets', 'Open Tickets'],
    datasets: [
      {
        label: 'Ticket Metrics',
        data: [
          chartData?.resolvedTickets || 0,
          chartData?.inProgressTickets || 0,
          chartData?.openTickets || 0
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(153, 102, 255, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw}`;
          },
        },
      },
    },
  };

  const barData = {
    labels: ['Resolved Tickets', 'In Progress Tickets', 'Open Tickets'],
    datasets: [
      {
        label: 'Today\'s Ticket Counts',
        data: [
          todayData?.resolvedTickets || 0,
          todayData?.inProgressTickets || 0,
          todayData?.openTickets || 0
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(153, 102, 255, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="chart-container" style={{ margin: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
      <h3>Ticket Metrics</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '45%' }}>
          {chartData ? (
            <Pie data={pieData} options={pieOptions} />
          ) : (
            <p>Loading ticket data...</p>
          )}
        </div>
        <div style={{ width: '45%' }}>
          {todayData ? (
            <Bar data={barData} options={barOptions} />
          ) : (
            <p>Loading today's data...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerTicketChart;
