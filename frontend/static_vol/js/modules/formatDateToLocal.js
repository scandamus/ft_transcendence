'use strict';

const formatDateToLocal = (utcString) => {
    const localDate = new Date(utcString);
    const year = localDate.getFullYear();
    const month = ('0' + (localDate.getMonth() + 1)).slice(-2);
    const day = ('0' + localDate.getDate()).slice(-2);
    const hours = ('0' + localDate.getHours()).slice(-2);
    const minutes = ('0' + localDate.getMinutes()).slice(-2);
    return `${year}/${month}/${day} ${hours}:${minutes}`;
};

export { formatDateToLocal };