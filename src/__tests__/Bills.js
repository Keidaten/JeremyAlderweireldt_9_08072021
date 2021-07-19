import { screen } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';

describe('Given I am connected as an employee', () => {
	describe('When I am on Bills Page', () => {
		test('Then bill icon in vertical layout should be highlighted', () => {
			const html = BillsUI({ data: [] });
			document.body.innerHTML = html;
			//to-do write expect expression
		});
		test('Then bills should be ordered from earliest to latest', () => {
			const html = BillsUI({ data: bills });
			document.body.innerHTML = html;
			const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map((a) => a.innerHTML);
			const antiChrono = (a, b) => (a < b ? 1 : -1);
			const datesSorted = [...dates].sort(antiChrono);
			expect(dates).toEqual(datesSorted);
		});
		describe('Given content is a loading', () => {
			test('Then a loading page should appear', () => {
				const html = BillsUI({ loading: true });
				document.body.innerHTML = html;
				expect(screen.getAllByText('Loading...')).toBeTruthy();
			});
		});
		describe('Given an error appends', () => {
			test('Then an error message should appear', () => {
				const html = BillsUI({ error: true });
				document.body.innerHTML = html;
				expect(screen.getAllByText('Erreur')).toBeTruthy();
			});
		});
	});
});
