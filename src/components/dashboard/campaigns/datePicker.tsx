import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateTimePickerType {
  date: Date | undefined;
  setDate: (date: Date) => void;
  disabled?: boolean;
  minDate?: Date;
}

const DateTimePicker: React.FC<DateTimePickerType> = ({ date, setDate, disabled, minDate }) => {
  const isToday = (someDate: Date) => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
      someDate.getMonth() === today.getMonth() &&
      someDate.getFullYear() === today.getFullYear();
  };

  return (
    <div>
      <DatePicker
        selected={date}
        onChange={date => {
          if (date) setDate(date);
        }}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        dateFormat="MMMM d, yyyy h:mm aa"
        className="w-full h-[2rem] border-b outline-blue-600 p-2"
        disabled={disabled}
        minDate={minDate ?? new Date()}
        minTime={date && isToday(date) ? new Date() : undefined}
        maxTime={date && isToday(date) ? new Date(new Date().setHours(23, 59, 59, 999)) : undefined}
      />
    </div>
  );
};

export default DateTimePicker;
