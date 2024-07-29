import moment from 'moment';

const dateFormatPlugin = (schema, options) => {
    schema.pre('save', function (next) {
        if (this.startDate) {
            this.startDate = moment(this.startDate).format('DD-MM-YYYY');
        }
        if (this.dueDate) {
            this.dueDate = moment(this.dueDate).format('DD-MM-YYYY');
        }
        if (this.invoiceDate) {
            this.invoiceDate = moment(this.invoiceDate).format('DD-MM-YYYY');
        }
        next();
    });

    schema.pre('findOneAndUpdate', function (next) {
        if (this._update.startDate) {
            this._update.startDate = moment(this._update.startDate).format('DD-MM-YYYY');
        }
        if (this._update.dueDate) {
            this._update.dueDate = moment(this._update.dueDate).format('DD-MM-YYYY');
        }
        if (this._update.invoiceDate) {
            this._update.invoiceDate = moment(this._update.invoiceDate).format('DD-MM-YYYY');
        }
        next();
    });
};

export default dateFormatPlugin;
