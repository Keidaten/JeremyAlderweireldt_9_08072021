import { screen } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import userEvent from '@testing-library/user-event';
import Bill from '../containers/Bills.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes';
import { localStorageMock } from '../__mocks__/localStorage.js';
import firebase from '../__mocks__/firebase';
import Firestore from '../app/Firestore';
import Router from '../app/Router';

describe('Given I am connected as an employee', () => {
	describe('When I am on Bills Page', () => {
		test('Then bill icon in vertical layout should be highlighted', () => {
			// Mock : paramètre pour bdd et data fetching
			jest.mock('../app/Firestore');
			Firestore.bills = () => ({
				bills,
				get: jest.fn().mockResolvedValue(),
			});

			Object.defineProperty(window, 'localStorage', {
				value: localStorageMock,
			});

			window.localStorage.setItem(
				'user',
				JSON.stringify({
					type: 'Employee',
				})
			);

			const pathname = ROUTES_PATH['Bills'];

			// build DOM
			Object.defineProperty(window, 'location', {
				value: {
					hash: pathname,
				},
			});
			document.body.innerHTML = `<div id="root"></div>`;

			// Init router pour récupérer les classes CSS "active"
			Router();
			expect(screen.getByTestId('icon-window').classList.contains('active-icon')).toBe(true);
		});
		test('Then bills should be ordered from earliest to latest', () => {
			const html = BillsUI({ data: bills });
			document.body.innerHTML = html;
			const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map((a) => a.innerHTML);
			const antiChrono = (a, b) => (a < b ? 1 : -1);
			const datesSorted = [...dates].sort(antiChrono);
			expect(dates).toEqual(datesSorted);
		});
		describe('If I click on "new bill"', () => {
			test('Then a new bill page should be open', () => {
				const onNavigate = (pathname) => {
					document.body.innerHTML = ROUTES({ pathname });
				};
				Object.defineProperty(window, 'localStorage', { value: localStorageMock });
				window.localStorage.setItem(
					'user',
					JSON.stringify({
						type: 'Employee',
					})
				);
				const newBill = new Bill({ document, onNavigate, firestore: null, localStorage: window.localStorage });
				const html = BillsUI({ data: bills });
				document.body.innerHTML = html;

				const handleClickNewBill = jest.fn(() => newBill.handleClickNewBill());

				const newBillButton = screen.getByTestId('btn-new-bill');

				newBillButton.addEventListener('click', handleClickNewBill);

				userEvent.click(newBillButton);

				expect(handleClickNewBill).toHaveBeenCalled();
				expect(screen.getByText('Envoyer une note de frais')).toBeTruthy();
			});
		});
		describe('If I click on eye icon', () => {
			test('Then a the modal file should appear', () => {
				//Defini le localStorage
				Object.defineProperty(window, 'localStorage', { value: localStorageMock });
				window.localStorage.setItem(
					'user',
					JSON.stringify({
						type: 'Employee',
					})
				);
				//Template html
				const html = BillsUI({ data: bills });
				document.body.innerHTML = html;

				// Navigation
				const onNavigate = (pathname) => {
					document.body.innerHTML = ROUTES({ pathname });
				};

				//Firestore = null
				const firestore = null;

				//Bill initialisation
				const newBill = new Bill({
					document,
					onNavigate,
					firestore,
					bills,
					localStorage: window.localStorage,
				});

				//Tests
				$.fn.modal = jest.fn();
				const eyes = screen.getAllByTestId('icon-eye');
				eyes.forEach((eye) => {
					const handleClickIconEye = jest.fn(() => newBill.handleClickIconEye(eye));
					eye.addEventListener('click', handleClickIconEye);
					userEvent.click(eye);
					expect(handleClickIconEye).toHaveBeenCalled();
				});
				expect(screen.getByText('Justificatif')).toBeTruthy();
			});
		});
	});
	describe('Given content is loading', () => {
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

describe('Given I am a user connected as Employee', () => {
	describe('When I navigate to Dashboard', () => {
		// vérifie que le get est correctement effecté
		test('fetches bills from mock API GET', async () => {
			const getSpy = jest.spyOn(firebase, 'get');
			const bills = await firebase.get();
			expect(getSpy).toHaveBeenCalledTimes(1);
			expect(bills.data.length).toBe(4);
		});
		// vérifie que la page d'erreur 404 est bien affichée si des données API sont introuvables
		test('fetches bills from an API and fails with 404 message error', async () => {
			firebase.get.mockImplementationOnce(() => Promise.reject(new Error('Erreur 404')));
			const html = BillsUI({ error: 'Erreur 404' });
			document.body.innerHTML = html;
			const message = await screen.getByText(/Erreur 404/);
			expect(message).toBeTruthy();
		});
		// vérifie que la page d'erreur 500 est bien affichée si une arreur serveur survient
		test('fetches messages from an API and fails with 500 message error', async () => {
			firebase.get.mockImplementationOnce(() => Promise.reject(new Error('Erreur 500')));
			const html = BillsUI({ error: 'Erreur 500' });
			document.body.innerHTML = html;
			const message = await screen.getByText(/Erreur 500/);
			expect(message).toBeTruthy();
		});
	});
});
