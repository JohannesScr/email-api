/* DATE */

/** format_date
 * @param date object/string
 * @description this function return a date string formatted YYYY-MM-DD
 * @return string */
const format_date = (date) => {
    let year;
    let month;
    let day;

    if (typeof date === 'string') {
        date = new Date(date);
    }

    year = date.getFullYear();
    month = ((date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1));
    day = date.getDate();

    return `${year}-${month}-${day}`;
};



/* EXPORTED FUNCTIONS */
module.exports = {
    format_date
};