import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of, tap } from 'rxjs';
import { IClient } from '../models/client.model';
import { ClientService } from './client.service';

@Injectable({
    providedIn: 'root'
})
export class ClientStorageService {
    private readonly STORAGE_KEY = 'cached_clients';
    private clientsSubject = new BehaviorSubject<IClient[]>([]);
    public clients$ = this.clientsSubject.asObservable();

    constructor(private clientService: ClientService) {
        this.loadFromStorage();
    }

    loadClients(): Observable<IClient[]> {
        return this.clientService.getClients().pipe(
            tap(clients => {
                this.clientsSubject.next(clients);
                this.saveToStorage(clients);
            })
        );
    }

    getClientById(id: number): Observable<IClient | null> {
        const cachedClients = this.clientsSubject.getValue();
        const cachedClient = cachedClients.find(c => c.id === id);

        if (cachedClient) {
            return of(cachedClient);
        }

        return this.clientService.getClientById(id).pipe(
            tap(client => {
                if (client) {
                    const updatedClients = [...cachedClients, client];
                    this.clientsSubject.next(updatedClients);
                    this.saveToStorage(updatedClients);
                }
            })
        );
    }

    getClientNameById(id: number): Observable<string> {
        return this.getClientById(id).pipe(
            map(client => client ? client.name : `Client #${id}`)
        );
    }

    searchClientsByName(name: string): Observable<IClient[]> {
        const cachedClients = this.clientsSubject.getValue();

        if (cachedClients.length > 0) {
            const searchTerm = name.toLowerCase();
            return of(cachedClients.filter(client =>
                client.name.toLowerCase().includes(searchTerm)
            ));
        }

        return this.loadClients().pipe(
            map(clients => {
                const searchTerm = name.toLowerCase();
                return clients.filter(client =>
                    client.name.toLowerCase().includes(searchTerm)
                );
            })
        );
    }

    saveClientId(id: number): void {
        localStorage.setItem('last_client_id', id.toString());
    }

    getLastClientId(): number | null {
        const id = localStorage.getItem('last_client_id');
        return id ? parseInt(id, 10) : null;
    }

    private loadFromStorage(): void {
        try {
            const storedData = localStorage.getItem(this.STORAGE_KEY);
            if (storedData) {
                const clients = JSON.parse(storedData) as IClient[];
                this.clientsSubject.next(clients);
            }
        } catch (error) {
            console.error('Error loading clients from storage:', error);
        }
    }

    private saveToStorage(clients: IClient[]): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(clients));
        } catch (error) {
            console.error('Error saving clients to storage:', error);
        }
    }
}