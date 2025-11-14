import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateTimePickerType {
  date: Date | undefined;
  setDate: (date: Date) => void;
  disabled?: boolean;
}

const DateTimePicker: React.FC<DateTimePickerType> = ({ date, setDate, disabled }) => {
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
      />
    </div>
  );
};

export default DateTimePicker;
