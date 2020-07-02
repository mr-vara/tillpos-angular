import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { User } from '@app/models';

@Injectable({ providedIn: 'root' })
export class AccountService {
    private userSubject: BehaviorSubject<User>;
    public user: Observable<User>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
        this.user = this.userSubject.asObservable();
    }

    public get userValue(): User {
        return this.userSubject.value;
    }

    login(email, password) {
        return this.http.post<User>(`${environment.apiUrl}/auth/login`, { email, password })
            .pipe(map(res => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                let user = {
                    access_token: res['access_token'],
                    name: res['user']['name'],
                    email: res['user']['email'],
                    id: res['user']['id']
                }
                localStorage.setItem('user', JSON.stringify(user));
                this.userSubject.next(user);
                return user;
            }));
    }

    logout() {
        // remove user from local storage and set current user to null
        this.http.post<User[]>(`${environment.apiUrl}/auth/logout`, {});
        localStorage.removeItem('user');
        this.userSubject.next(null);
        this.router.navigate(['/account/login']);
    }

    register(user: User) {
        return this.http.post(`${environment.apiUrl}/auth/register`, user);
    }

    getMe() {
        return this.http.get<User[]>(`${environment.apiUrl}/user/me`);
    }

    update(id, params) {
        return this.http.put(`${environment.apiUrl}/user/update`, params)
            .pipe(map(res => {
                // update stored user if the logged in user updated their own record
                if (id == this.userValue.id) {
                    // update local storage
                    let user = {
                        name: res['name'],
                        email: res['email'],
                        id: res['id'],
                        access_token: this.userValue.access_token
                    }
                    localStorage.setItem('user', JSON.stringify(user));
                    this.userSubject.next(user);
                }
                return res;
            }));
    }
}