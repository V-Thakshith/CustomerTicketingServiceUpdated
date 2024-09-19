import React, { useEffect, useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement } from 'chart.js';
import api from '../api';

// Register necessary components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement);

const TicketChart = ({ ticketCount, ticketResolved, ticketInProgress, ticketOpen, agentId }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/users/ticketsByAgentToday/${agentId}`);
        console.log(response.data);
        // Assuming response.data contains today's metrics in the following format
        const { resolvedTicketsToday, inProgressTicketsToday, assignedTicketsToday } = response.data;
        
        setChartData({
          resolvedTicketsToday,
          inProgressTicketsToday,
          assignedTicketsToday,
        });
      } catch (error) {
        console.error("Error fetching ticket data:", error);
      }
    };

    fetchData();
  }, [agentId]);

  const pieData = {
    labels: ['Total Tickets', 'Resolved Tickets', 'In Progress Tickets', 'Open Tickets'],
    datasets: [
      {
        label: 'Ticket Metrics',
        data: [ticketCount, ticketResolved, ticketInProgress, ticketOpen],
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)',
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(153, 102, 255, 1)',
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
    labels: [ 'Resolved Tickets', 'In Progress Tickets', 'Assigned Tickets'],
    datasets: [
      {
        label: 'Today\'s Ticket Counts',
        data: [
          chartData?.resolvedTicketsToday || 0,
          chartData?.inProgressTicketsToday || 0,
          chartData?.assignedTicketsToday || 0,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(153, 102, 255, 1)',
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
          <Pie data={pieData} options={pieOptions} />
        </div>
        <div style={{ width: '45%' }}>
          {chartData ? (
            <Bar data={barData} options={barOptions} />
          ) : (
            <p>Loading today's data...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketChart;
