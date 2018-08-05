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

/** generate_token_uuid
 * @param token_id number
 * @description Generates a unique uuid with the token_id
 * @return uuid string
 * */
const generate_token_uuid = (token_id) => {
    let now = new Date;
    let year = now.getFullYear();
    let month = (now.getMonth() + 1) < 10 ? '0' + (now.getMonth() + 1) : (now.getMonth() + 1);
    let day = now.getDate();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    let milliseconds = now.getMilliseconds();
    let random = Math.random().toString().split('.')[1].substr(0, 4);

    return `${token_id}-${random}-${year}-${month}-${day}-${hours}-${minutes}-${seconds}-${milliseconds}`;
};

/* EXPORTED FUNCTIONS */
module.exports = {
    format_date,
    generate_token_uuid
};