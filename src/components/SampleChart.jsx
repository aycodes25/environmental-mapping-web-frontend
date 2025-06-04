// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import BarChart from './BarChart';


const SampleBarChart = ({ barChartSampleType }) => {
  const [selectedData, setSelectedData] = useState('dailyData');
  const keysArray = barChartSampleType?.data && barChartSampleType.data[selectedData]
    ? Object.keys(barChartSampleType.data[selectedData])[0]
    : '';
  const [selectedSampleType, setSelectedSampleType] = useState(keysArray);
  const getDayOfWeekName = (dayNumber) => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return daysOfWeek[dayNumber - 1];
  };

  const getMonthName = (monthNumber) => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return months[monthNumber - 1];
  };

  const handleSampleTypeChange = (e) => {
    setSelectedSampleType(e.target.value);
  };

  const handleDataChange = (e) => {
    setSelectedData(e.target.value);
  };

  const isDaily = selectedData === 'dailyData';
  const data =
    barChartSampleType?.data &&
    barChartSampleType.data[selectedData] &&
    barChartSampleType.data[selectedData][selectedSampleType]
      ? barChartSampleType.data[selectedData][selectedSampleType].map((item, i) => ({
          ...item,
          label: isDaily
            ? getDayOfWeekName(item.dayOfWeek)
            : getMonthName(item.month),
          key: isDaily ? `day_${item.dayOfWeek}_${i}` : `month_${item.month}_${i}`,
        }))
      : [];

  return (
    <div className='flex flex-col flex-grow gap-5 justify-start items-start p-2 w-full h-auto'>
      <div className='flex flex-row justify-between items-center w-full'>
        <div className='justify-center items-center font-bold'>
          {barChartSampleType.title}
        </div>
        <div className='flex gap-3 justify-center items-center'>
          <select
            id='sampleType'
            value={selectedSampleType}
            className='px-2 py-1 rounded-md border'
            onChange={handleSampleTypeChange}>
            {barChartSampleType?.data[selectedData] &&
              Object.keys(barChartSampleType.data[selectedData]).map(
                (type, i) => (
                  <option key={i} value={type} className='capitalize'>
                    {type}
                  </option>
                )
              )
            }
            
          </select>
          <select
            id='data'
            value={selectedData}
            className='px-2 py-1 rounded-md border'
            onChange={handleDataChange}>
            <option value='dailyData'>{barChartSampleType.daily}</option>
            <option value='monthlyData'>{barChartSampleType.monthly}</option>
          </select>
        </div>
      </div>
      <div className='block w-full h-full'>
        {data && data.length > 0 ? (
           <BarChart
           barDataKey="totalTags"
           xAxisKey="label"
           barColor="#8884d8"
           data={data}
           />
        ) : (
          <div className='flex justify-center items-center h-full font-bold capitalize'>
            {barChartSampleType?.alt}
          </div>
        )}
      </div>
    </div>
  );
};

export default SampleBarChart;
